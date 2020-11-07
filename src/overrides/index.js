function initOverrides() {
  (function extendArray() {
    function pushUnique(newValue) {
      if (typeof newValue === 'string' || typeof newValue === 'number') {
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
    function remove(value) {
      if (typeof value === 'string' || typeof value === 'number') {
        const matchIndex = this.indexOf(value)
        this.splice(matchIndex, 1)
        // eslint-disable-next-line consistent-return
        return this
      }
      Error('Invalid input for uniquePush method. Accepts only strings and numbers.')
      // eslint-disable-next-line consistent-return
      return this
    }
    Object.defineProperty(Array.prototype, 'remove', {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
      get() {
        return remove.bind(this);
      }
    });
  }())
}

export default initOverrides
