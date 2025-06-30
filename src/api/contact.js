import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetchier, endpoints } from 'src/utils/axios';

import { BACK_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosService = axios.create({ baseURL: BACK_API });

// ----------------------------------------------------------------------

export function useGetContacts() {
  const endpoint = endpoints.contact.list;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, fetchier, {
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
    };
  }, [data?.data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function createContact(contactData) {
  try {
    const payload = {
      ...contactData,
      telefonos: contactData.telefonos || [],
      emails: contactData.emails || [],
      direcciones: contactData.direcciones || [],
      foto_path: contactData.foto ? 'juan.png' : null,
    };

    const response = await axiosService.post(endpoints.contact.create, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al crear contacto:', error.response?.data || error.message);
    throw error;
  }
}

export async function updateContact(contactId, contactData) {
  try {
    const formData = new FormData();

    // Agregar campos básicos
    Object.keys(contactData).forEach((key) => {
      if (key !== 'foto' && key !== 'telefonos' && key !== 'emails' && key !== 'direcciones') {
        formData.append(key, contactData[key]);
      }
    });

    // Agregar foto si existe (y es un archivo nuevo)
    if (contactData.foto && contactData.foto instanceof File) {
      formData.append('foto', contactData.foto);
    }

    // Agregar arrays como JSON
    if (contactData.telefonos) {
      formData.append('telefonos', JSON.stringify(contactData.telefonos));
    }
    if (contactData.emails) {
      formData.append('emails', JSON.stringify(contactData.emails));
    }
    if (contactData.direcciones) {
      formData.append('direcciones', JSON.stringify(contactData.direcciones));
    }

    const response = await axios.put(endpoints.contact.update(contactId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    throw error;
  }
}
