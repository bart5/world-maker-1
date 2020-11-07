function initOverrides() {
  (function extendArray() {
    function pushUnique(newValue) {
      if (typeof newValue === 'string') {
        if (this.some((v) => v === newValue)) return
        this.push(newValue)
        // eslint-disable-next-line consistent-return
        return this
      } else if (typeof newValue === 'number') {
        if (this.some((v) => v === newValue)) return
        this.push(newValue)
        // eslint-disable-next-line consistent-return
        return this
      }
      Error('Invalid input for uniquePush method. Accepts only strings and numbers.')
      // eslint-disable-next-line consistent-return
      return this
    }
    Object.defineProperty(Array.prototype, 'pushUnique', {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
      get() {
        return pushUnique.bind(this);
      }
    });
  }())
}

export default initOverrides
