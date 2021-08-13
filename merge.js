/****************************************************************************************************************
 * @file merge.js
 * @fileoverview this script merge to csv fileA.csv and fileB.csv in a single and verifies the keys with Piano systems sandbox
 * 
 * @author Ing. Damian Corbalan
 * 
 ***************************************************************************************************************/


'use strict'
const axios = require('axios');
const csv  =require('csvtojson')
const fs = require('fs');

const aid = "o1sRRZSLlw"
const token = "zziNT81wShznajW2BD5eLA4VCkmNJ88Guye7Sw4D"

/**
 * merge
 * @summary merge the two csv files with piano info.
 * @param {object[]} pianoUserArray - piano users array
 * @returns {object[]} - mergedList of users
 */
const merge = async (pianoUserArray) => {
    try {
        var  filea =await csv().fromFile('./filea.csv');        
        var  fileb =await csv().fromFile('./fileb.csv');   
        var mergeJson = filea.map(el => {
            var obj = fileb.find(uid => uid.user_id === el.user_id )
            var pianoUser = pianoUserArray.find(user => user.email === el.email)
            return {
                user_id: (pianoUser !== undefined) ? pianoUser.uid :el.user_id,
                email: el.email,
                first_name: obj.first_name,
                last_name: obj.last_name
            }
        })
    return mergeJson
       
    } catch (err) {
        if(err)   console.error(err)
    }
}

/**
 * getPianoUserList
 * @summary conects with piano api and fetchs user list
 * @param {string} a_id 
 * @param {sting} api_token 
 * @returns 
 */
const getPianoUserList = async (a_id, api_token) => {
    const pianoApi = axios.create({
        baseURL: `https://sandbox.piano.io/api/v3/`, // apunta a la url de iu https://inventario.unificado.movistar.com.ar
        headers:{               
            "Content-type": "application/x-www-form-urlencoded", // urlencoded
            api_token: api_token // api-token provided
        },
        //rejectUnauthorized: false // para evitar la verificacion ssl del servidor.
    })
    try {
        var userList = await pianoApi.get(`publisher/user/list?aid=${a_id}` )
        if(!userList.data.code) return userList.data.users
        else {
            console.error("Somethings happens, code: ", users.userList.data.code)
            throw users.userList.data.code
        }
    } catch (err) {
        throw err
    }
}

/**
 * 
 * @param {object[]} vector - Json Vector to convert to csv
 * @param {string} filename - output filename
 * @param {string} separador - separator character default ','
 */
const toCSv = (vector, filename, separador) => {
    const items = vector
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    separador = separador || ','
    filename = filename || "report"
    const csv = [
    header.join(separador), // header row first
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(separador))
    ].join('\r\n')
    fs.writeFile(`./${filename}.csv`,csv, err=> {
        if(err) console.log(err)
        else console.log("archivo creado");
    })
}



/***********************
 * Execution
 * get from piano the list of users
 * merge the two csvfiles in one with the correct uid
 * output the merged csv file
 ***********************/
getPianoUserList(aid,token).then(response => {
    merge(response).then(mergedList => {
        toCSv(mergedList, "output", ",")
    })
}).catch(error => {
    throw error
})

