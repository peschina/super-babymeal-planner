<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { profileStore } from '$lib/stores/profile';

  onMount(() => {
    if (!profileStore.isOnboarded()) {
      goto('/onboarding');
    }
  });
</script>

<p>Loading...</p>
