interface Array<T> {
  /**
   * Only use for appending values to string or number arrays.
   */
  pushUnique(newItem: string | number): Array<T>
  /**
   * Remove first found instance of value from the array.
   */
  remove(itemToRemove: string | number): Array<T>
}
