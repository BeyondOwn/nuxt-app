<script setup lang="ts">
import { ref } from 'vue';

const email = ref('')
const password = ref('')


function GoogleAuth() {
    window.location.href = `/auth/google`
}


const signInWithDiscord = async () => {
    console.log("from disc")
    const supabase = useSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
    });
    if (error) {
        console.error("Discord sign in error: ", error)
    };

};

onMounted(async () => {
    const client = await useSupabaseClient();
    const { data, error } = await client.auth.getUser();
    console.log(data.user)
    if (data.user) {
        navigateTo('/')
    }
})

</script>
<template>
    <div
        class="min-h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] flex justify-center items-center bg-background px-4 sm:px-6 lg:px-8">
        <div
            class="max-w-md max-h-fit space-y-8 bg-card border-border border-2 text-card-foreground shadow-lg rounded-lg p-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-foreground">Log in or sign up</h2>
            </div>
            <div class="space-y-4">
                <button @click="signInWithDiscord"
                    class="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-background text-secondary-foreground hover:bg-background/90 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-ring">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                        alt="Google logo" class="mr-2 h-5 w-5" />
                    Continue with Google
                </button>

                <div class="flex items-center justify-center">
                    <div class="w-full border-t border-border"></div>
                    <span class="px-3 bg-background/90 text-muted-foreground text-sm">OR</span>
                    <div class="w-full border-t border-border"></div>
                </div>

                <input type="email" v-model="email" placeholder="Email address"
                    class="w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary" />
                <input type="password" v-model="password" placeholder="Password"
                    class="w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary" />
                <button @click="() => signInWithDiscord"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-ring">Continue
                    with email</button>
            </div>

            <div class="text-center text-xs text-muted-foreground">
                By continuing, you acknowledge that you have read, understood, and agree to our
                <a href="#" class="underline hover:text-primary">Terms & Conditions</a>
                and <a href="#" class="underline hover:text-primary">Privacy Policy</a>
            </div>
        </div>
    </div>
</template>
