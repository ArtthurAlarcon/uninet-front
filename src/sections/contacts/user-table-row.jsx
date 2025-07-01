import { useState } from 'react'; // Añade esta importación
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { deleteContact } from 'src/api/contact';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, onEditRow, onRefresh }) {
  const {
    id_contacto,
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    alias,
    foto_path,
    telefonos,
    emails,
    direcciones,
  } = row;

  const [isDeleting, setIsDeleting] = useState(false); // Estado para controlar la carga
  const { enqueueSnackbar } = useSnackbar();

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  // Función para formatear correos electrónicos
  const formatEmails = () => {
    if (!emails || emails.length === 0) return 'Sin correos';
    return emails.map((e) => e.email).join(', ');
  };

  // Función para formatear teléfonos
  const formatPhones = () => {
    if (!telefonos || telefonos.length === 0) return 'Sin teléfonos';
    return telefonos.map((t) => `${t.telefono} (${t.tipo})`).join(', ');
  };

  // Función para formatear direcciones
  const formatAddress = () => {
    if (!direcciones || direcciones.length === 0) return 'Sin dirección';
    const primary = direcciones[0];
    return `${primary.calle} ${primary.numero_exterior}, ${primary.colonia}, ${primary.municipio}`;
  };

  const handleDelete = async () => {
    setIsDeleting(true); // Activar estado de carga

    try {
      await deleteContact(id_contacto);
      enqueueSnackbar('Contacto eliminado correctamente', { variant: 'success' });
      onRefresh(); // Actualizar la lista
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error al eliminar el contacto', {
        variant: 'error',
      });
    } finally {
      setIsDeleting(false); // Desactivar estado de carga
      confirm.onFalse(); // Cerrar diálogo
    }
  };

  return (
    <>
      <TableRow hover key={id_contacto}>
        <TableCell>
          <TableCell>
            <Avatar
              alt={`${nombre} ${apellido_paterno}`}
              src={
                foto_path
                  ? `${import.meta.env.VITE_BACK_API}/api/contactos/foto/${foto_path}`
                  : '/assets/images/avatar_default.jpg'
              }
              sx={{ width: 48, height: 48 }}
            />
          </TableCell>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nombre || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{apellido_paterno || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{apellido_materno || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{alias || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fecha_nacimiento || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatEmails()}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatPhones()}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatAddress()}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => !isDeleting && confirm.onFalse()} // No permitir cerrar durante eliminación
        title="Eliminar contacto"
        content="¿Estás seguro de que deseas eliminar este contacto?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" />
              )
            }
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onRefresh: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
};
