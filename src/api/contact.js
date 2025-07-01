import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetchier, endpoints } from 'src/utils/axios';

import { BACK_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosService = axios.create({
  baseURL: BACK_API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ----------------------------------------------------------------------

export function useGetContacts() {
  const endpoint = endpoints.contact.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoint, fetchier, {
    revalidateOnFocus: true, // ← Esta es la opción clave
    revalidateIfStale: true,
    revalidateOnReconnect: true,
    refreshInterval: 0,
  });

  const memoizedValue = useMemo(() => {
    const contacts = data?.data.map((contact) => ({
      ...contact,
      textColor: contact.color,
    }));

    return {
      contacts: contacts || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !data?.data.length,
      mutateContacts: mutate,
    };
  }, [data?.data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}

// En tu servicio de API (contact.js)
// En tu archivo API (api/contact.js)
export const updateContact = async (id, data, config = {}) => {
  // Si data es FormData (cuando viene del formulario)
  if (data instanceof FormData) {
    const response = await axiosService.post(`/api/contactos/actualizar/${id}`, data, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Si data es un objeto normal (para otros usos)
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  const response = await axiosService.post(`/api/contactos/actualizar/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createContact = async (data, config = {}) => {
  const response = await axiosService.post('/api/contactos', data, config);
  return response.data;
};

export function useGetContactById(id) {
  const endpoint = id ? `/api/contactos/${id}` : null;

  const { data, error, isLoading } = useSWR(endpoint, fetchier, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  console.log(data?.data);

  return {
    contact: data?.data, // Asegúrate que coincide con la estructura de tu API
    isLoading,
    error,
  };
}

export const deleteContact = async (id) => {
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BACK_API}/api/contactos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    throw error;
  }
};
