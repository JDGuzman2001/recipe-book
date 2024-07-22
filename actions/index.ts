'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/supabase/client';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Sends a recipe by validating form data and inserting it into the "recipes" table in Supabase.
 * Redirects to the home page upon success or returns an error message upon failure.
 */
export async function sendRecipe(prevState: any, formData: FormData){
    const formEntries = Object.fromEntries(formData.entries());
    console.log(formEntries);

    const schema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        url: z.string().url(),
        email: z.string().min(1).email("This is not a valid Email address"),
    });

    const validateFields = schema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        url: formData.get('url'),
        email: formData.get('email'),
    });
    if (!validateFields.success){
        return{
            type: "error",
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Missing required fields, failed to upload item',
        }
    } 

    const {
        title,
        description,
        url,
        email

    } = validateFields.data;

    try {
        const supabase = createClient();
        const { error: recipesError } = await supabase.from("recipes").insert({
            title, 
            description, 
            url: url,
            email: email
            })

            if (recipesError){
                return {
                    type: "error",
                    message: 'Database Error: Failed to create item',
                }
            } 
    } catch (error) {
        return {
            type: "error",
            message: 'Failed to create item',
        }
    }
    revalidatePath('/');
    return {
        type: "success",
        message: 'Recipe created successfully',
    };
}

export async function deleteProject(projectId: string) {
    console.log('Deleting project', projectId);
    if (!projectId) {
        return {
            type: "error",
            message: 'Invalid project ID provided',
        };
    }

    try {
        const supabase = createClient();

        const { error } = await supabase
            .from("recipes")
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error('Database Error: Failed to delete project', error);
            return {
                type: "error",
                message: 'Database Error: Failed to delete project',
            };
        }
        console.log('Project deleted successfully');
        revalidatePath('/');
        return {
            type: "success",
            message: 'Project deleted successfully',
        };

    } catch (error) {
        console.error('Failed to delete project', error);
        return {
            type: "error",
            message: 'Failed to delete project',
        };
    }
    
}