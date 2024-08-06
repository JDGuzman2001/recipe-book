"use client";
import * as React from "react";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from '@/context/user-context/userContext';
import { sendRecipe } from '@/actions';
import { useFormState } from 'react-dom';
import { deleteProject } from '@/actions/index';
import SubmitButton from '@/components/home/upload-recipe/submitButton';
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
  } from "@/components/ui/menubar"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpenIcon } from "@heroicons/react/24/solid"
import { PlayCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"


interface Project {
    id: number;
    title: string;
    description: string;
    url: string;
}

const initialState = {
    message: "",
    errors: null,
};
  

export default function UserType() {
    const { user, setUser, recipes, getRecipes } = useUser();
    const supabase = createClient();
    const router = useRouter();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showRecipes, setShowRecipes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [email, setEmail] = useState("");

    const [deleteStatus, setDeleteStatus] = useState<string | null>(null); 

    React.useEffect(() => {
        const checkUser = async () => {
            if (user) {
                try {
                    const { data: { user }, error } = await supabase.auth.getUser()
                    if (error) {
                        router.replace('/');
                        return;
                    }
                    
                    if (user) {
                        setLoadingPage(false); 
                    } 
                } catch (error) {
                    router.replace('/');
                }
            }
        };

        checkUser();
    }, [user, router, supabase]);


    const [state, formAction] = useFormState<any>(
        sendRecipe as any,
        initialState
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    const handleCreateProject = () => {
        setShowCreateForm(true);
        setShowRecipes(false);
        const email = user.email;
        setEmail(email);
    };

    const handleViewProjects = async () => {
        setShowRecipes(true);
        setShowCreateForm(false);
        setLoading(true);
        await getRecipes();
        setLoading(false);
    };

    const handleDeleteClick = async (id: number) => {
        const result = await deleteProject(id.toString());
        if (result.type === "success") {
            setDeleteStatus('Project deleted successfully');
            router.refresh();
        } else {
            setDeleteStatus(result.message);
        }
    };

    if (loadingPage) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <BookOpenIcon className="w-40 h-40 text-gray-500" />
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md flex justify-between items-center px-4 py-2">
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger onClick={handleCreateProject}>Crear receta</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={handleViewProjects}>Ver mis recetas</MenubarTrigger>
                    </MenubarMenu>
                    
                </Menubar>
                <Button onClick={handleLogout} className="ml-auto" variant="destructive">
                    Salir
                </Button>
            </div>
            <main className="flex flex-col items-center justify-center min-h-screen bg-cyan-200 pt-16">
                {!showCreateForm && !showRecipes && (
                    <div className="flex flex-col items-center justify-center">
                        <BookOpenIcon className="w-40 h-40 text-gray-500" />
                        <span className="text-4xl font-bold">Bienvenido</span>
                        <span className="text-lg">Crea recetas o mira tus recetas</span>
                    </div>
                )
                }
                {showCreateForm && (
                    <div className="mx-auto w-[70%] h-full p-12 rounded-lg border-2 border-gray-500 border-opacity-10 shadow-lg bg-slate-100">
                        <form action={formAction} >
                            <div className="grid w-full items-center gap-1.5 mb-4">
                                <Label htmlFor="title">Título</Label>
                                <Input 
                                    type="string" 
                                    id="title" 
                                    name="title"
                                    placeholder="Título"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    />
                                {state?.errors?.title && (
                                <span id="name-error" className="text-red-600 text-sm">
                                    {state.errors.title.join(',')}
                                </span>
                                )}
                            </div>
                            <div className="grid w-full items-center gap-1.5 mb-4">
                                <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Descripción"
                                        value={description}
                                        className="h-24 w-full border rounded-lg p-2"
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                {state?.errors?.description && (
                                <span id="name-error" className="text-red-600 text-sm">
                                    {state.errors.description.join(',')}
                                </span>
                                )}
                            </div>   
                            <div className="grid w-full items-center gap-1.5 mb-4">
                                <Label htmlFor="url">Link del video</Label>
                                <Input 
                                    type="string" 
                                    id="url" 
                                    name="url"
                                    placeholder="Link del video"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    />
                                {state?.errors?.url && (
                                <span id="name-error" className="text-red-600 text-sm">
                                    {state.errors.url.join(',')}
                                </span>
                                )}
                            </div>

                            <input type="hidden" name="email" value={email} />
                            
                            
                            <SubmitButton/>
                        </form>
                    </div>
                )}
                {showRecipes && (
                    <div className="mx-10 flex flex-col">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <span>Cargando...</span>
                            </div>
                        ) : !recipes || recipes.length === 0 ? (
                            <div className=" flex flex-col items-center justify-center h-full">
                                <BookOpenIcon className="w-40 h-40 text-gray-500" />
                                <h1>No tienes recetas aún</h1>
                            </div>
                        ) : (
                            recipes && recipes.map((recipe: Project) => (
                                <Card key={recipe.id} className="w-full mb-4">
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="flex justify-between">
                                                {recipe.title}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                    <TrashIcon className="h-6 w-6 cursor-pointer text-red-400"/>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-auto">
                                                        <DialogHeader>
                                                        <DialogTitle>Borrar receta</DialogTitle>
                                                        <DialogDescription>
                                                            Esto es irreversible
                                                        </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <div className="flex justify-between">
                                                                <Button type="submit" onClick={() => handleDeleteClick(recipe.id)}>Sí</Button>
                                                                <Button onClick={() => router.refresh()}>No</Button>    
                                                            </div>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                    </Dialog>
                                            </div>

                                        </CardTitle>
                                        <CardDescription>{recipe.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex justify-center">
                                        <Button 
                                            variant="outline" 
                                            className="cursor-default hover:bg-white bg-red-500 text-white"
                                            onClick={() => window.open(recipe.url, '_blank')}
                                        >
                                            <div className="flex items-center">
                                                Mirar receta en Youtube
                                                <PlayCircleIcon className="h-6 w-6 ml-2" />
                                            </div>
                                            
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                )}
                
            </main>
        </div>
    );
}


  
