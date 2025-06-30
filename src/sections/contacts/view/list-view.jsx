import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetContacts } from 'src/api/contact';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

// ----------------------------------------------------------------------

// Actualiza TABLE_HEAD para que coincida con tus datos
const TABLE_HEAD = [
  { id: 'foto', label: 'Fotografía', width: 120 },
  { id: 'nombre', label: 'Nombre' },
  { id: 'apellido_paterno', label: 'Apellido paterno' },
  { id: 'apellido_materno', label: 'Apellido materno' },
  { id: 'alias', label: 'Alias' },
  { id: 'fecha_nacimiento', label: 'Fecha nacimiento' },
  { id: 'emails', label: 'Correos electrónicos', width: 220 },
  { id: 'telefonos', label: 'Teléfonos', width: 220 },
  { id: 'direcciones', label: 'Dirección', width: 220 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const { contacts } = useGetContacts();

  const [tableData, setTableData] = useState(contacts || []);

  const [filters, setFilters] = useState(defaultFilters);

  // Sincroniza tableData con contacts
  useEffect(() => {
    if (contacts) {
      setTableData(contacts);
    }
  }, [contacts]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xlg'}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            component={RouterLink}
            href={paths.contact.create}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nuevo contacto
          </Button>
        </Box>

        <Card>
          <UserTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    const searchTerm = name.toLowerCase();
    const sinTerm = 'sin '.toLowerCase();

    inputData = inputData.filter((contact) => {
      // Campos directos
      const basicFieldsMatch =
        (contact.nombre && contact.nombre.toLowerCase().includes(searchTerm)) ||
        (contact.apellido_paterno && contact.apellido_paterno.toLowerCase().includes(searchTerm)) ||
        (contact.apellido_materno && contact.apellido_materno.toLowerCase().includes(searchTerm)) ||
        (contact.alias && contact.alias.toLowerCase().includes(searchTerm)) ||
        (contact.fecha_nacimiento && contact.fecha_nacimiento.includes(searchTerm));

      // Buscar en emails (incluyendo "Sin correos")
      const emailsMatch =
        contact.emails?.some((email) => email.email.toLowerCase().includes(searchTerm)) ||
        (searchTerm.startsWith(sinTerm) &&
          'correos'.includes(searchTerm.replace(sinTerm, '')) &&
          (!contact.emails || contact.emails.length === 0));

      // Buscar en teléfonos (incluyendo "Sin teléfonos")
      const phonesMatch =
        contact.telefonos?.some(
          (phone) =>
            phone.telefono.includes(searchTerm) ||
            (phone.tipo && phone.tipo.toLowerCase().includes(searchTerm)) ||
            (phone.etiqueta_personalizada &&
              phone.etiqueta_personalizada.toLowerCase().includes(searchTerm))
        ) ||
        (searchTerm.startsWith(sinTerm) &&
          'teléfonos telefonos'.includes(searchTerm.replace(sinTerm, '')) &&
          (!contact.telefonos || contact.telefonos.length === 0));

      // Buscar en direcciones (incluyendo "Sin dirección")
      const addressMatch =
        contact.direcciones?.some(
          (address) =>
            (address.calle && address.calle.toLowerCase().includes(searchTerm)) ||
            (address.colonia && address.colonia.toLowerCase().includes(searchTerm)) ||
            (address.municipio && address.municipio.toLowerCase().includes(searchTerm)) ||
            (address.estado && address.estado.toLowerCase().includes(searchTerm)) ||
            (address.codigo_postal && address.codigo_postal.includes(searchTerm))
        ) ||
        (searchTerm.startsWith(sinTerm) &&
          'dirección direccion'.includes(searchTerm.replace(sinTerm, '')) &&
          (!contact.direcciones || contact.direcciones.length === 0));

      return basicFieldsMatch || emailsMatch || phonesMatch || addressMatch;
    });
  }

  return inputData;
}
