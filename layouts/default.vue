<script setup lang="ts">


const client = useSupabaseClient();
const user = await useSupabaseUser();
// console.log("User from nav: ", user)
const switchToggle = ref();
const { theme, toggleTheme } = useTheme();

watch(theme, () => {
    // console.log(theme.value);
})

</script>
<template>
    <div class="font-poppins text-foreground bg-background">
        <nav class="h-[40px] w-screen  bg-info-500 flex flex-col justify-center ">
            <div class="2xl:w-7xl w-100vw 2xl:place-self-center flex flex-row items-center py-2 justify-between">
                <div class="space-x-2">
                    <NuxtLink to="/">Home</NuxtLink>
                    <!-- <NuxtLink to="/about">About</NuxtLink>
                <NuxtLink to="/contact">Contact</NuxtLink> -->
                    <NuxtLink to="/scoreboards">Scoreboards</NuxtLink>
                    <NuxtLink to="/stats">Stats</NuxtLink>
                </div>
                <div class="flex flex-row justify-center items-center">
                    <UButton @click="client.auth.signOut()" variant="outline" class="text-foreground">Logout</UButton>
                    <USwitch color="info" @click="toggleTheme"> </USwitch>
                    <img v-if="user" class="w-8 h-8 rounded-2xl" fit="cover" :src="user.user_metadata.avatar_url" />
                    <Icon class="w-8 h-8 rounded-2xl" v-else name="material-symbols:account-circle"></Icon>
                </div>
            </div>
        </nav>
        <main class="flex flex-col w-screen h-[calc(100vh-40px)]">
            <slot />
        </main>
        <footer />
    </div>
</template>
