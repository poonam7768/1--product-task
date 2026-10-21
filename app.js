const cl = console.log;


const productform = document.getElementById('productform')
const productname = document.getElementById('productname')
const productprice = document.getElementById('productprice')
const productcategory = document.getElementById('productcategory')
const productquantity = document.getElementById('productquantity')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const productcontainer = document.getElementById('productcontainer')
const spinner = document.getElementById('spinner')


const Base_url = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const Product_url = `${Base_url}products.json`

const state = {
     productArr :[],
     edit_id :null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.productArr.unshift(obj[key])
    }
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}

function makeApiCall(url,methodName,body=null){
    return fetch(url,{
        method:methodName,
        headers:{
            "Content-Type":"application/json",
            "auth":"JWT token"
        },
        body:body ? JSON.stringify(body) : null
    })
    .then(res=>{
        if(!res.ok){
            throw new Error ()
        }
        return res.json()
    })
}

//read....!


function oncreate(){
    handleSpinner(true)
    makeApiCall(Product_url,"GET")
     .then(data =>{
        cl(data)
        objToArr(data)
        templiting(state.productArr)
     })
     .catch(err=>{
        snackBar("something went wrong !!!" , "error")
     })
     .finally(()=>{
        handleSpinner()
     })
}
oncreate()

function templiting(arr){
    let result = ``
    arr.forEach((p,i)=>{
        result += `
                <tr id="${p.id}">
                    <td>${i+1}</td>
                    <td>${p.name}</td>
                    <td>${p.price}</td>
                    <td>${p.category}</td>
                    <td>${p.quantity}</td>
                    <td><button onclick="onedit(this)" class="btn btn-secondary">Edit</button></td>
                    <td><button onclick="ondelete(this)" class="btn btn-danger">Delete</button></td>
                </tr>`
    })
    productcontainer.innerHTML = result;
}


//create....!

function onAddstd(eve){
     eve.preventDefault();
     let newObj = {
       name:productname.value,
        price:productprice.value,
        category:productcategory.value,
        quantity:productquantity.value
     }
     handleSpinner(true)
     makeApiCall(Product_url,"POST",newObj)
     .then(res=>{
        cl(res)
        newObj.id = res.name
        state.productArr.unshift(newObj)
        templiting(state.productArr)
        snackBar('new product data added successfully !','success')
        productform.reset()
     })
     .catch(err=>{
        snackBar(err,'error')
     })
     .finally(()=>{
        handleSpinner()
     })
}

//edit..!

function onedit(ele){
    let editId = ele.closest('tr').id
    state.edit_id = editId
    let editObj = state.productArr.find(m=>m.id=== editId)

    productname.value = editObj.name,
    productprice.value = editObj.price,
    productcategory.value = editObj.category,
    productquantity.value = editObj.quantity,
    

    addbtn.classList.add('d-none')
    updatebtn.classList.remove('d-none')

}

function onupdatestd(eve){
    let updateId = state.edit_id;
    let updateUrl = `${Base_url}products/${updateId}.json`
    let updatedObj = {
        name : productname.value,
        price : productprice.value,
        category : productcategory.value,
        quantity : productquantity.value,
        id: updateId
    }
    handleSpinner(true)
    makeApiCall(updateUrl,"PATCH",updatedObj)
     .then(res=>{
        let getIndex = state.productArr.findIndex(s=> s.id === updateId)
        state.edit_id = null;
        state.productArr[getIndex] = updatedObj;

        templiting(state.productArr)

        updatebtn.classList.add('d-none')
        addbtn.classList.remove('d-none')
        productform.reset()

        snackBar('updated successfully !','success')

     })
     .catch(err=>{
        snackBar(err,"error")
     })
     .finally(()=>{
        handleSpinner()
     })
}
//delete....!

function ondelete(ele){
    let removeId = ele.closest('tr').id

     Swal.fire({
  title: "Are you sure?",
  icon: "warning",
  showCancelButton: true,
  
  confirmButtonText: "Yes, Remove it!"
}).then((result) => {
  if (result.isConfirmed) {
    handleSpinner(true)
    let removeUrl= `${Base_url}products/${removeId}.json`
    makeApiCall(removeUrl,"DELETE")
     .then(res =>{
        let getIndex = state.productArr.findIndex(t=> t.id === removeId)
        state.productArr.splice(getIndex,1)
        ele.closest('tr').remove()

        let td = [...document.querySelectorAll("#productcontainer tr td:first-child")];
                       td.forEach((td,i)=>{
                        td.innerHTML = i+1
                       })
        snackBar(`the data removed successfully !!!`,'success')
     })
     .catch(err=>{
        snackBar(err,'error')
     })
     .finally(()=>{
        handleSpinner()
     })
  }
  })
}

productform.addEventListener("submit",onAddstd)
updatebtn.addEventListener("click",onupdatestd)