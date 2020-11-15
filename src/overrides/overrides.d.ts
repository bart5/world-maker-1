interface Array<T> {
  /**
   * Only use for appending values to string or number arrays.
   */
  pushUnique(newItem: any): Array<T>
  /**
   * Remove first found instance of value from the array.
   */
  remove(itemToRemove: any): Array<T>
  /**
   * Remove first found instance of value from the array.
   */
  last(): T
}
