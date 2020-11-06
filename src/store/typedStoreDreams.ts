// const makeStorePayload = (
//   data: {
//     getters: { [k: string]: (...args: any[]) => any },
//     mutations
//   }
// ) => {

// }

// const makeGetter = (getterF: (...args: any[]) => any, state: any) => {
// return {
//   [getterF.name]: (state) => getterF
// }
// }

// const makeMutation = <T>(mutationF: (payload: T) => any, state: any) => {
// return {
//   [mutationF.name]: (state, payload: T) => mutationF(payload)
// }
// }

// const makeAction = <T>(actionF: (payload: T) => any, state: any) => {
// return {
//   [actionF.name]: (state, payload: T) => actionF(payload)
// }
// }