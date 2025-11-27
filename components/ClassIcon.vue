<template>
    <div 
      class="class-icon" 
      :style="iconStyle"
      :title="iconData?.name"
    />
  </template>
  
  <script setup lang="ts">
  import { CLASS_ICONS, SPRITE_CONFIG, getClassIconOffset } from '@/server/utils/classIcons'
import { computed } from 'vue'
  
  const props = defineProps({
    class: {
      type: String,
      required: true
    },
    scale: {
      type: Number,
      default: 1
    },
    white: {
      type: Boolean,
      default: true
    }
  })
  
  const iconData = computed(() => CLASS_ICONS[props.class.toLowerCase()])
  
  const iconStyle = computed(() => {
    const yOffset = getClassIconOffset(props.class)
    const size = SPRITE_CONFIG.iconSize
    
    return {
      backgroundImage: `url('${SPRITE_CONFIG.url}')`,
      backgroundPosition: `0px ${yOffset }px`,
      backgroundSize: `${SPRITE_CONFIG.spriteSize}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundRepeat: 'no-repeat',
      filter: props.white ? 'brightness(0) invert(1)' : 'none',
      transform: `scale(${props.scale})`,
      transformOrigin: 'center center'
    }
  })
  </script>
  
  <style scoped>
  .class-icon {
    display: inline-block;
  }
  </style>