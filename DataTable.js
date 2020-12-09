import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import { Card, TextField } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SweetAlert from 'react-bootstrap-sweetalert'
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IntlMessages from 'util/IntlMessages';


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array?.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}



function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, dynamicHeadCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all' }}
            color="primary"

          />
        </TableCell>
        {dynamicHeadCells.map((headCell, i) => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center">
          Actions
                </TableCell>
      </TableRow>

    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, loading } = props;

  const [searchValue, addSearchValue] = useState('');
  const [warning, setWarning] = useState(false);


  const deleteDatas = () => {
    setWarning(true);
  }
  const onCancelDelete = () => {
    setWarning(false)
  }

  const onConfirmDelete = () => {
    props.deleteData(props.selectedIds)
    setWarning(false)
  }


  return (
    <Toolbar
      className="table-header">
      <div className="title">
        {numSelected > 0 ?
          (<Typography variant="subtitle2">{numSelected} Selected
            {loading ? (<CircularProgress style={{ width: "20px", height: "20px", margin: "20px 0 0 15px" }} />) : null}

          </Typography>)
          :
          <div className="pb-2">
            <Typography variant="h6">
              {props.tableInfo.name} List
                        {loading ? (<CircularProgress style={{ width: "20px", height: "20px", margin: "20px 0 0 15px" }} />) : null}
            </Typography>
          </div>
        }
      </div>
      <div className="spacer" />
      <div className="actions">
        <SweetAlert show={warning}
          warning
          showCancel
          confirmBtnText={<IntlMessages id="sweetAlerts.yesDeleteIt" />}
          confirmBtnBsStyle="danger"
          cancelBtnBsStyle="default"
          title={<IntlMessages id="sweetAlerts.areYouSure" />}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        ></SweetAlert>
        <div>


          {numSelected === 0 &&

            <div>
              <TextField
                placeholder="Search...."
                onKeyUp={() => props.searchedValue(searchValue)}
                value={searchValue}
                onChange={e => addSearchValue(e.target.value)}
              />
            </div>

          }
          {numSelected >= 1 &&
            <>

              <Tooltip title="Permanent Delete">
                <IconButton aria-label="Delete" onClick={() => deleteDatas()}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          }
        </div>
      </div>
    </Toolbar>
  );
};



const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const ListTable = (props) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('date');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchResults, setSearchResuts] = React.useState([]);

  const { tableInfo, authUser, permissionDelete, permissionEdit, loading, permissionView } = props

  /***
   * CREATES TABLE HEADS BASED ON FIELDS PASSED AS PROPS
  */
  const dynamicHeadCells = tableInfo.fields.map(x => {
    if (x.indexOf('.') > -1) {
      let seperatedByDot = x.split('.').slice(-2, -1)[0]
      if (seperatedByDot.indexOf('_') > -1) {
        let seperatedByUnderScore = seperatedByDot.split('_').join(' ')
        return { id: seperatedByUnderScore, label: seperatedByUnderScore.replace(/^./, seperatedByUnderScore[0].toUpperCase()) }
      } else {

        return { id: seperatedByDot, label: seperatedByDot.replace(/^./, seperatedByDot[0].toUpperCase()) }
      }
    } else {
      if (x.indexOf('_') > -1) {
        return { id: x.split('_').join(' '), label: x.split('_').join(' ').replace(/^./, x.split('_').join(' ')[0].toUpperCase()) }
      } else {
        return { id: x, label: x.replace(/^./, x[0].toUpperCase()) }

      }

    }
  })


  /***
   * CREATES DATA AND STORES IN ROWS STATE ***** SHOULD SEND CORRECT DATA FROM PARENT COMPONENT
   */

  React.useEffect(() => {

    let newData = []
    if (tableInfo.datas) {
      newData = newData.concat(tableInfo.datas)
    } else {
      newData = []
    }
    setRows(newData)
  }, [tableInfo.datas])



  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const isSelected = (name) => selected.indexOf(name) !== -1;

  const nestedObject = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

  const handleSearchedValue = (value) => {

    const filteredData = rows?.filter((row) =>
      tableInfo.fields.some(
        (columns) => {
          if (columns.indexOf('.') > -1) {
            let splittedColumn = columns.split('.')
            return nestedObject(splittedColumn, row).toString().toLowerCase().indexOf(value.toLowerCase()) > -1

          } else {
            return row[columns].toString().toLowerCase().indexOf(value.toLowerCase()) > -1
          }
        }
      )
    );
    setSearchResuts(filteredData)
  }



  let datas = searchResults.length === 0 ? rows : searchResults



  return (
    <>
      <Card className="px-2 py-2 my-3" style={{ flex: 1 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          searchedValue={handleSearchedValue}
          selectedIds={selected}
          loading={loading}
          tableInfo={tableInfo}
          deleteData={props.deleteData}

        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"

          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={datas?.length}
              dynamicHeadCells={dynamicHeadCells}

            />
            <TableBody>
              {datas.length < 1 ?
                <TableRow>
                  <TableCell align="center" colSpan={7} >
                    <Typography variant="h6">
                      {
                        loading ? "..." : `No Data Available`
                      }

                    </Typography>
                  </TableCell>
                </TableRow>

                :
                <>
                  {stableSort(datas, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row.id);
                      const labelId = `enhanced-table-checkbox-${index}`;
                     

                      return (
                        <TableRow
                          hover

                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': labelId }}
                              color="primary"
                              onClick={(event) => handleClick(event, row.id)}

                            />
                          </TableCell>
                          {
                            tableInfo.fields.map((x, i) => {
                              if (x.indexOf('.') > -1) {
                                let splittedColumn = x.split('.')
                                return <TableCell align={"left"} key={i}>{nestedObject(splittedColumn, row)}</TableCell>
                              } else {
                                return <TableCell align={"left"} key={i}>{row[x]}</TableCell>

                              }
                            })
                          }

                          <TableCell align="center" className="tatatable__new__action">
                            
                              <Tooltip title={`Details `}>
                                <VisibilityIcon onClick={() => props.detailView(row.id)} style={{ cursor: 'pointer' }} />
                              </Tooltip>
                              


                              <Tooltip title={`Edit`}>
                                <IconButton onClick={() => props.editData(row.id)}>
                                  <EditIcon style={{ color: "#000" }} />
                                </IconButton>
                              </Tooltip>
                              

                          </TableCell>
                        </TableRow>
                      );
                    })}
                </>
              }

            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Card>

    </>
  );
}
export default ListTable;
