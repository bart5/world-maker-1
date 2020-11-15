function initOverrides() {
  (function extendArray() {
    function pushUnique(this: any[], newValue: any) {
      if (typeof newValue === 'string' || typeof newValue === 'number' || typeof newValue === 'object') {
        if ((this as unknown as any[]).some((v) => v === newValue)) return
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

    function remove(this: any[], value: any) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'object') {
        const matchIndex = this.indexOf(value)
        if (matchIndex >= 0) {
          this.splice(matchIndex, 1)
        }
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
        return remove.bind(this as Array<any>);
      }
    });

    function last(this: any[]) {
      return this
    }
    Object.defineProperty(Array.prototype, 'remove', {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
      get() {
        return last.bind(this as Array<any>);
      }
    });
  }())
}

export default initOverrides
