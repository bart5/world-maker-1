interface Array<T> {
  /**
   * Only use for appending values to string or number arrays
   */
  pushUnique(newItem: string | number): Array<T>
}
