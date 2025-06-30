import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

export default function UserTableRow({ row, onEditRow, onDeleteRow }) {
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

  return (
    <>
      <TableRow hover key={id_contacto}>
        <TableCell>
          <TableCell>
            <Avatar
              alt={`${nombre} ${apellido_paterno}`}
              src={
                foto_path
                  ? `/assets/images/contacts/pictures/${foto_path.split('/').pop()}`
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
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

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
        onClose={confirm.onFalse}
        title="Eliminar contacto"
        content="¿Estás seguro de que deseas eliminar este contacto?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
};
