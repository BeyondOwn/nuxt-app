// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules:{
      "vue/html-self-closing":'off',
      "vue/multiline-html-element-content-newline":'off',
      "vue/first-attribute-linebreak":'off',
      "vue/attributes-order":'off',
      "@typescript-eslint/no-explicit-any":"off",
    }
  }
)
