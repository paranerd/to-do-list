<template>
    <Navbar />
    <router-view/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '@/components/Navbar.vue';

export default defineComponent({
    name: 'app',
    components: {
        Navbar,
    },
    provide() {
        return {
            test: 'worx'
        }
    }
});
</script>