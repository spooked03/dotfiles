export default {
  id: "websearch.exa-parallel",

  async setup(ctx) {
    await ctx.websearch.transform((editor) => {
      editor.add({
        id: "exa-parallel",
        name: "Exa → Parallel",

        async execute({ query }, { signal }) {
          try {
            const response = await ctx.websearch.query(
              { query, providerID: "exa" },
              { signal },
            )
            return response.data.results
          } catch (error) {
            if (signal.aborted) throw error

            const response = await ctx.websearch.query(
              { query, providerID: "parallel" },
              { signal },
            )
            return response.data.results
          }
        },
      })

      editor.default.set("exa-parallel")
    })
  },
}
