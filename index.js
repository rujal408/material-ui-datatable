import React from 'react'
import DataTable from './DataTable'

/***
 * 1. DATAS SHOULD BE SENT IN PROPER FORMAT ***** NOT OBJECTS OR ARRAYS.
 * 2. datas WILL BE LIST OF ARRAYS FROM REDUX
 * 3. REDUCE datas IN PROPER FORMAT AT PARENT COMPONENT AND SEND TO TABLE (CHILD COMPONENT)
 */

const tableDatas = {
    tableTitle: "Office",
    fields: ['name', 'longitude.value', 'latitude', 'address'],
    datas: [
        { id: 1, name: 'aaa', longitude: {value:123}, latitude: '65913', address: 'ktm' },
        { id: 2, name: 'aaa', longitude: {value:123}', latitude: '65913', address: 'pkr' },
       
    ]
}

const DynamicTableIndex = () => {
    return (
        <div className="main__container mt__4">
            <DataTable 
            tableInfo={tableDatas} 
            deleteData={(ids) => functionName(id)}
            editData={(id) => functionName(id)}
            detailView={(id) => functionName(id)}
            loading={true or false}
            />
        </div>
    )
}

export default DynamicTableIndex
