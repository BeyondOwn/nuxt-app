<script setup lang="ts">


const client = useSupabaseClient();
const user = await useSupabaseUser();
const uploaderRef = ref();

if (user.value) {
    // console.log("USER ID : ", user.value.id)
    const { data: uploader, error } = await client.
        from('user_roles')
        .select('role_name')
        .eq('user_id', user?.value?.id);

    if (uploader!.length > 0) {
        uploaderRef.value = uploader;
    }
}
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
                    <NuxtLink to="/">Scoreboards</NuxtLink>
                    <!-- <NuxtLink to="/about">About</NuxtLink>
                <NuxtLink to="/contact">Contact</NuxtLink> -->
                    <NuxtLink to="/stats">Stats</NuxtLink>
                    <NuxtLink v-if="!user" to="/login">Login</NuxtLink>
                    <NuxtLink v-if="uploaderRef" to="/upload">Upload</NuxtLink>
                </div>
                <div class="flex flex-row justify-center items-center">
                    <UButton v-if="user" @click="client.auth.signOut()" variant="outline" class="text-foreground">Logout
                    </UButton>
                    <USwitch color="info" @click="toggleTheme"> </USwitch>
                    <img v-if="user" class="w-8 h-8 rounded-2xl" fit="cover" :src="user.user_metadata.avatar_url" />
                    <Icon size="32" class="w-8 h-8 rounded-2xl" v-else name="material-symbols:account-circle"></Icon>
                </div>
            </div>
        </nav>
        <main class="flex flex-col w-screen h-[calc(100vh-40px)]">
            <slot />
        </main>
        <footer />
    </div>
</template>
