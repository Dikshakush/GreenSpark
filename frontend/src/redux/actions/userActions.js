// userActions.js

export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo'); // Clear from storage

  dispatch({ type: 'USER_LOGOUT' });   // Dispatch logout action
};
