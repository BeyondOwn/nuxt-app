<script setup lang="ts">


const client = useSupabaseClient();
const user = await useSupabaseUser();
console.log("User from nav: ", user)
const switchToggle = ref();
const { theme, toggleTheme } = useTheme();

watch(theme, () => {
    console.log(theme.value);
})

</script>
<template>
    <div class="font-poppins text-foreground bg-background">
        <nav class="h-[40px] w-screen  bg-green-600 p-2 flex flex-row items-center justify-between">
            <div class="space-x-2">
                <NuxtLink to="/">Home</NuxtLink>
                <NuxtLink to="/about">About</NuxtLink>
                <NuxtLink to="/contact">Contact</NuxtLink>
                <NuxtLink to="/scoreboards">Scoreboards</NuxtLink>
                <NuxtLink to="/login">Login</NuxtLink>
            </div>
            <div class="flex flex-row justify-center items-center">
                <UButton @click="client.auth.signOut()" variant="outline" class="text-foreground">Logout</UButton>
                <USwitch @click="toggleTheme"> </USwitch>
                <img v-if="user" class="w-8 h-8 rounded-2xl" fit="cover" :src="user.user_metadata.avatar_url" />
                <Icon class="w-8 h-8 rounded-2xl" v-else name="material-symbols:account-circle"></Icon>
            </div>
        </nav>
        <main class="flex flex-col w-screen h-[calc(100vh-40px)]">
            <slot />
        </main>
        <footer />
    </div>
</template>
