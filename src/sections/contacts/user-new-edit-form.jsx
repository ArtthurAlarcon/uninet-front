import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { Switch, FormControlLabel } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fData } from 'src/utils/format-number';

import { createContact, updateContact } from 'src/api/contact';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFTextField, RHFAutocomplete } from 'src/components/hook-form'; // Asegúrate de que la ruta
// ----------------------------------------------------------------------

export default function ContactNewEditForm({ currentContact }) {
  // const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [showPhones, setShowPhones] = useState(false);
  const [showEmails, setShowEmails] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const ContactSchema = Yup.object().shape({
    nombre: Yup.string().required('Nombre es requerido'),
    apellido_paterno: Yup.string().required('Apellido paterno es requerido'),
    apellido_materno: Yup.string().nullable(),
    fecha_nacimiento: Yup.date()
      .required('Fecha de nacimiento es requerida')
      .typeError('Fecha no válida')
      .max(new Date(), 'La fecha no puede ser futura'),
    alias: Yup.string().nullable().max(50, 'El alias no puede exceder 50 caracteres'),
    foto: Yup.mixed()
      .nullable()
      .test('fileSize', 'La imagen es muy grande (máx 3MB)', (value) => {
        if (!value) return true;
        return value.size <= 3145728;
      })
      .test('fileType', 'Formatos soportados: JPEG, JPG, PNG', (value) => {
        if (!value) return true;
        return ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type);
      }),
    telefonos: Yup.array()
      .nullable()
      .of(
        Yup.object().shape({
          telefono: Yup.string().when('$hasPhone', {
            is: (hasPhone) => hasPhone,
            then: (schema) =>
              schema
                .required('Teléfono es requerido')
                .matches(/^[0-9]+$/, 'Solo números permitidos'),
            otherwise: (schema) => schema.nullable(),
          }),
          tipo: Yup.string().nullable(),
          etiqueta_personalizada: Yup.string().nullable(),
        })
      ),
    emails: Yup.array()
      .nullable()
      .of(
        Yup.object().shape({
          email: Yup.string().when('$hasEmail', {
            is: (hasEmail) => hasEmail,
            then: (schema) => schema.email('Email debe ser válido').required('Email es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          es_principal: Yup.boolean().default(false),
          notas: Yup.string().nullable(),
        })
      ),
    direcciones: Yup.array()
      .nullable()
      .of(
        Yup.object().shape({
          calle: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Calle es requerida'),
            otherwise: (schema) => schema.nullable(),
          }),
          numero_exterior: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Número exterior es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          numero_interior: Yup.string().nullable(),
          colonia: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Colonia es requerida'),
            otherwise: (schema) => schema.nullable(),
          }),
          municipio: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Municipio es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          estado: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Estado es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          codigo_postal: Yup.string().when('$hasAddress', {
            is: (hasAddress) => hasAddress,
            then: (schema) => schema.required('Código postal es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          pais: Yup.string().default('México'),
          tipo: Yup.string().default('Casa'),
        })
      ),
  });

  const defaultValues = useMemo(
    () => ({
      nombre: currentContact?.nombre || '',
      apellido_paterno: currentContact?.apellido_paterno || '',
      apellido_materno: currentContact?.apellido_materno || '',
      // fecha_nacimiento: currentContact?.fecha_nacimiento || null,
      fecha_nacimiento: currentContact?.fecha_nacimiento || '', // Cambiado de null a ''
      alias: currentContact?.alias || '',
      foto: currentContact?.foto || null,
      telefonos: currentContact?.telefonos || [],
      emails: currentContact?.emails || [],
      direcciones: currentContact?.direcciones || [],
    }),
    [currentContact]
  );

  const methods = useForm({
    resolver: yupResolver(ContactSchema),
    defaultValues,
    context: {
      hasPhone: showPhones,
      hasEmail: showEmails,
      hasAddress: showAddresses,
    },
  });

  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentContact) {
        // Actualizar contacto existente
        await updateContact(currentContact.id, data);
        enqueueSnackbar('Contacto actualizado con éxito!');
      } else {
        // Crear nuevo contacto
        await createContact(data);
        enqueueSnackbar('Contacto creado con éxito!');
      }

      // Redirigir al listado después de 1.5 segundos
      // setTimeout(() => {
      //   router.push(paths.contact.root);
      // }, 1500);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        `${error.response?.data?.message}SSS` || 'Ocurrió un error al procesar la solicitud',
        { variant: 'error' }
      );
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setValue('foto', file, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue('foto', null, { shouldValidate: true });
  };

  const addPhone = () => {
    if (!showPhones) setShowPhones(true);
    const currentPhones = values.telefonos || [];
    setValue('telefonos', [
      ...currentPhones,
      {
        telefono: '',
        tipo: 'Móvil',
        etiqueta_personalizada: '',
      },
    ]);
  };

  const removePhone = (index) => {
    const newPhones = [...values.telefonos];
    newPhones.splice(index, 1);
    setValue('telefonos', newPhones);
    if (newPhones.length === 0) setShowPhones(false);
  };

  const addEmail = () => {
    if (!showEmails) setShowEmails(true);
    const currentEmails = values.emails || [];
    setValue('emails', [
      ...currentEmails,
      {
        email: '',
        es_principal: currentEmails.length === 0, // El primero será principal por defecto
        notas: '',
      },
    ]);
  };

  const removeEmail = (index) => {
    const newEmails = [...values.emails];
    newEmails.splice(index, 1);
    setValue('emails', newEmails);
    if (newEmails.length === 0) setShowEmails(false);
  };

  const addAddress = () => {
    if (!showAddresses) setShowAddresses(true);
    const currentAddresses = values.direcciones || [];
    setValue('direcciones', [
      ...currentAddresses,
      {
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        municipio: '',
        estado: '',
        codigo_postal: '',
        pais: 'México',
        tipo: 'Casa',
      },
    ]);
  };

  const removeAddress = (index) => {
    const newAddresses = [...values.direcciones];
    newAddresses.splice(index, 1);
    setValue('direcciones', newAddresses);
    if (newAddresses.length === 0) setShowAddresses(false);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 5, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              {selectedFile || currentContact?.foto ? (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={selectedFile ? URL.createObjectURL(selectedFile) : currentContact?.foto}
                    alt="Foto de contacto"
                    sx={{
                      borderRadius: 1,
                      width: '100%',
                      height: 'auto',
                      maxHeight: 300,
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon="mingcute:delete-line" width={20} />
                  </IconButton>
                </Box>
              ) : (
                <RHFUpload
                  name="foto"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      Formatos permitidos: .jpeg, .jpg, .png, .gif
                      <br /> Tamaño máximo: {fData(3145728)}
                    </Typography>
                  }
                />
              )}
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="nombre" label="Nombre(s)" />
              <RHFTextField name="apellido_paterno" label="Apellido Paterno" />
              <RHFTextField name="apellido_materno" label="Apellido Materno" />
              <RHFTextField
                name="fecha_nacimiento"
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField name="alias" label="Alias" />
            </Box>

            {/* Botones para agregar secciones opcionales */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:phone-line" />}
                onClick={addPhone}
              >
                Agregar Teléfono
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:mail-line" />}
                onClick={addEmail}
              >
                Agregar Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:location-line" />}
                onClick={addAddress}
              >
                Agregar Dirección
              </Button>
            </Stack>

            {/* Sección de Teléfonos - Solo aparece si hay teléfonos */}
            {(showPhones || (values.telefonos && values.telefonos.length > 0)) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Teléfonos
                </Typography>

                {values.telefonos?.map((phone, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={4}>
                        <RHFTextField
                          name={`telefonos.${index}.telefono`}
                          label="Número de Teléfono"
                        />
                      </Grid>
                      <Grid xs={12} sm={3}>
                        <RHFAutocomplete
                          name={`telefonos.${index}.tipo`}
                          label="Tipo"
                          options={['Móvil', 'Casa', 'Trabajo', 'Otro']}
                          freeSolo
                        />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField
                          name={`telefonos.${index}.etiqueta_personalizada`}
                          label="Etiqueta Personalizada"
                        />
                      </Grid>
                      <Grid xs={12} sm={1} display="flex" alignItems="center">
                        <IconButton onClick={() => removePhone(index)} color="error">
                          <Iconify icon="mingcute:delete-line" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* Sección de Correos Electrónicos - Solo aparece si hay emails */}
            {(showEmails || (values.emails && values.emails.length > 0)) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Correos Electrónicos
                </Typography>

                {values.emails?.map((email, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={5}>
                        <RHFTextField
                          name={`emails.${index}.email`}
                          label="Correo Electrónico"
                          type="email"
                        />
                      </Grid>
                      <Grid xs={12} sm={5}>
                        <RHFTextField name={`emails.${index}.notas`} label="Notas" />
                      </Grid>
                      <Grid xs={12} sm={2} display="flex" alignItems="center">
                        <Controller
                          name={`emails.${index}.es_principal`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Switch {...field} checked={field.value} />}
                              label="Principal"
                              labelPlacement="start"
                            />
                          )}
                        />
                        <IconButton onClick={() => removeEmail(index)} color="error" sx={{ ml: 1 }}>
                          <Iconify icon="mingcute:delete-line" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* Sección de Direcciones - Solo aparece si hay direcciones */}
            {(showAddresses || (values.direcciones && values.direcciones.length > 0)) && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Direcciones
                </Typography>

                {values.direcciones?.map((address, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={6}>
                        <RHFTextField name={`direcciones.${index}.calle`} label="Calle" />
                      </Grid>
                      <Grid xs={12} sm={3}>
                        <RHFTextField
                          name={`direcciones.${index}.numero_exterior`}
                          label="Número Exterior"
                        />
                      </Grid>
                      <Grid xs={12} sm={3}>
                        <RHFTextField
                          name={`direcciones.${index}.numero_interior`}
                          label="Número Interior"
                        />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField name={`direcciones.${index}.colonia`} label="Colonia" />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField name={`direcciones.${index}.municipio`} label="Municipio" />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField name={`direcciones.${index}.estado`} label="Estado" />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField
                          name={`direcciones.${index}.codigo_postal`}
                          label="Código Postal"
                        />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFTextField name={`direcciones.${index}.pais`} label="País" />
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <RHFAutocomplete
                          name={`direcciones.${index}.tipo`}
                          label="Tipo"
                          options={['Casa', 'Trabajo', 'Otro']}
                          freeSolo
                        />
                      </Grid>
                      <Grid xs={12} display="flex" justifyContent="flex-end">
                        <Button
                          onClick={() => removeAddress(index)}
                          color="error"
                          startIcon={<Iconify icon="mingcute:delete-line" />}
                        >
                          Eliminar Dirección
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 3, width: '100%' }}
            >
              <Button
                component={RouterLink}
                to={paths.contact.root} // Asegúrate de que esta ruta sea correcta
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              >
                Regresar
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentContact ? 'Crear Contacto' : 'Guardar Cambios'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ContactNewEditForm.propTypes = {
  currentContact: PropTypes.object,
};
