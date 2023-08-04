<script setup lang="ts">
</script>

<template>
  <div class="home">
    home
    
    <div class="home__config-menu">
      <h2 class="home__config-menu__title">Config</h2>
      <ul class="home__config-menu__buttons">
        <li>
          <button>Load</button>
        </li>
        <li>
          <button>Create</button>
        </li>
      </ul>
    </div>
  </div>
  
</template>

<style lang="scss">
.home {
  &__config-menu {
    margin-top: 10px;
    
    &__title {
      font-size: 1.5rem;
    }
    
    &__buttons {
      border: 1px solid black;
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}
</style>