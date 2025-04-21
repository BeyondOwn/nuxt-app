<template>
    <div class="flex items-center justify-center space-x-2">
        <!-- First page button -->
        <button v-if="showPreviousEllipsis" @click="goToPage(1)" :disabled="currentPage <= 1"
            class="px-3 py-1 rounded border hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-center items-center">
            <UIcon size="24" name="material-symbols:first-page" />
        </button>

        <!-- Previous button -->
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
            class="px-3 py-1 rounded border hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-center items-center">
            <UIcon size="24" name="material-symbols:chevron-left" />
        </button>

        <!-- Previous ellipsis -->
        <!-- <span v-if="showPreviousEllipsis" class="px-2 flex items-center">...</span> -->

        <!-- Page buttons - limited to 4 -->
        <button v-for="page in visiblePageNumbers" :key="page" @click="goToPage(page)" :class="[
            'px-3 py-1 rounded border',
            currentPage === page ? `${props.color} hover:${props.hoverColor} text-white` : `hover:${props.hoverColor}`
        ]">
            {{ page }}
        </button>

        <!-- Next ellipsis -->
        <span v-if="showNextEllipsis" class="px-2 flex items-center">...</span>

        <!-- Next button -->
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
            class="px-3 py-1 rounded border hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-center items-center">
            <UIcon size="24" name="material-symbols:chevron-right" />
        </button>

        <!-- Last page button -->
        <button v-if="showNextEllipsis" @click="goToPage(totalPages)" :disabled="currentPage >= totalPages"
            class="px-3 py-1 rounded border hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-center items-center">
            <UIcon size="24" name="material-symbols:last-page" />
        </button>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    page: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        required: true
    },
    maxVisiblePages: {
        type: Number,
        default: 4  // Changed to 4 as requested
    },
    color: {
        type: String,
        default: 'bg-blue-500',
    },
    hoverColor: {
        type: String,
        default: 'bg-blue-400'
    }
})

const emit = defineEmits(['update:page'])

const currentPage = ref(props.page)

// Update internal page when prop changes
watch(() => props.page, (newPage) => {
    currentPage.value = newPage
})

// Calculate visible page numbers - limited to 4
const visiblePageNumbers = computed(() => {
    const visiblePages = []
    const halfVisiblePages = Math.floor(props.maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage.value - halfVisiblePages)
    let endPage = Math.min(props.totalPages, startPage + props.maxVisiblePages - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < props.maxVisiblePages) {
        startPage = Math.max(1, endPage - props.maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage && visiblePages.length < props.maxVisiblePages; i++) {
        visiblePages.push(i)
    }

    return visiblePages
})

// Show ellipsis before or after
const showPreviousEllipsis = computed(() => {
    return visiblePageNumbers.value[0] > 1
})

const showNextEllipsis = computed(() => {
    return visiblePageNumbers.value[visiblePageNumbers.value.length - 1] < props.totalPages
})

// Handle page change
function goToPage(page) {
    if (page < 1 || page > props.totalPages) return
    currentPage.value = page
    emit('update:page', page)
}

// Ensure component updates when totalPages changes
watch(() => props.totalPages, () => {
    // Ensure current page is still valid
    if (currentPage.value > props.totalPages) {
        currentPage.value = Math.max(1, props.totalPages)
        emit('update:page', currentPage.value)
    }
})
</script>