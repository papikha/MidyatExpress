import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const deleteExpiredListings = async() =>{
    const now = Date.now();
    const {data: listings, error: listingsGetError} = await supabase.from("listings").select("id, created_at, image_paths");
    if (!listings) return;

    for (const listing of listings){
        if (now - (new Date(listing.created_at).getTime()) >= 1000 * 60 * 60 * 24 * 30 ){
            const images = Object.values(listing.image_paths) || []
            for(const img of images){
                const path = img.split("Listings/")[1]
                const {data, error} = await supabase.storage.from("Listings").remove([path])
            };
            await supabase.from("listings").delete().eq("id", listing.id);
        };
    }
};
const cronExpression = "*/5 * * * *"

const task = cron.schedule(cronExpression, () =>{
    deleteExpiredListings();
});