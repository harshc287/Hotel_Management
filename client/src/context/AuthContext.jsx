
import {
  createContext,
  useEffect,
  useState,
} from 'react';

import { api } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the user's session when the application starts.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem('rms_token');

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        let response;

        try {
          response = await api.get('/auth/me');
        } catch (error) {
          // If the access token expired, try the HTTP-only refresh cookie.
          if (error.response?.status !== 401) {
            throw error;
          }

          const refreshResponse = await api.post('/auth/refresh');
          const newToken = refreshResponse.data?.data?.accessToken;

          if (!newToken) {
            throw new Error('Could not refresh your session.');
          }

          localStorage.setItem('rms_token', newToken);

          response = await api.get('/auth/me');
        }

        const currentUser = response.data?.data?.user;

        if (!currentUser) {
          throw new Error('Invalid current-user response.');
        }

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        localStorage.removeItem('rms_token');

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const result = response.data?.data;
    const accessToken = result?.accessToken;
    const loggedInUser = result?.user;

    if (!response.data?.success || !accessToken || !loggedInUser) {
      throw new Error('Invalid login response from server.');
    }

    localStorage.setItem('rms_token', accessToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  // Registration
  const register = async (payload) => {
    const cleanPayload = {
      ...payload,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
    };

    if (cleanPayload.role !== 'manager') {
      delete cleanPayload.restaurantName;
    } else if (cleanPayload.restaurantName) {
      cleanPayload.restaurantName = cleanPayload.restaurantName.trim();
    }

    const response = await api.post('/auth/register', cleanPayload);

    const result = response.data?.data;
    const accessToken = result?.accessToken;
    const registeredUser = result?.user;

    if (!response.data?.success || !accessToken || !registeredUser) {
      throw new Error('Invalid registration response from server.');
    }

    localStorage.setItem('rms_token', accessToken);
    setUser(registeredUser);

    return registeredUser;
  };

  // Logout
  const logout = async () => {
    try {
      if (localStorage.getItem('rms_token')) {
        await api.post('/auth/logout');
      }
    } finally {
      localStorage.removeItem('rms_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
