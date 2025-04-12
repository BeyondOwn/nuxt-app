<script setup lang="ts">
import UploadArea from '@/components/UploadArea.vue';
const supabase = useSupabaseClient();
const user = useSupabaseUser();
console.log("Auth: ", user.value);
</script>
<template>
    <div class="flex flex-col items-center justify-center w-full h-[calc(100vh-40px)]">
        <UploadArea />
    </div>
</template>