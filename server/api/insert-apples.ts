import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/supabase';

export default defineEventHandler(async(event) => {
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);
    if (!supabase){
        console.log("No supabase");
        return;
    }
    const { data,error } = await supabase
        .from('test')
        .insert([{apples:'altcv',user_id:user?.id}])
        .select('*');
        if(error){
            console.log(error);
            return error;
        }
        else{
            console.log("DATA: ",data)
            return data;
        }
        
   
});
