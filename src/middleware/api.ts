/* eslint-disable */
// const BASE_URL = ''; // 'http://localhost:3001/api'
// const BASE_URL = "http://localhost:5354/";
import { DB } from "./demo-db"

import { Entity } from '../types';
import url from 'url';
import querystring from 'querystring';
import { HttpMethod } from "../store/types";

const ds = Object.assign({}, DB)
const EXPAND = "_expand"

function getModel(action: string) {
  if (action.includes("/")) {
    return action.substring(0, action.indexOf("/"))
  }
  else {
    return action;
  }
}

function getId(action: string): number {
  if (action.includes("/")) {
    return parseInt(action.substring(action.indexOf("/") + 1))
  }
  else {
    return 0
  }
}

function getExpand(qs: TODO) {
  if (EXPAND in qs) {
    return qs[EXPAND];
  }
  else return ''
}

function parseRequest(req: string) {
  const parsedUrl = url.parse(req);
  const parsedQs = querystring.parse(parsedUrl.query);
  const model = getModel(parsedUrl.pathname);
  const id = getId(parsedUrl.pathname);
  const exp = getExpand(parsedQs)
  return { model, id, exp }
}

export function getData(action: string, filters): Promise<TODO> {
  const { model, id, exp } = parseRequest(action)
  return new Promise(function (resolve, _reject) {
    const expandModel = exp
      ? exp === "category"
        ? "categories"
        : exp + "s"
      : exp;

    
    let result;
    let expand: string, expandId: number;
    
    if (model in ds) {
      if (id && id > 0) {
        result =
          ds[model][ds[model].findIndex((d: { id: number }) => d.id === id)];
        if (expandModel) {
          expand =
            expandModel === "categories"
              ? "category"
              : expandModel.substr(0, expandModel.length - 1);
          expandId = result[expand + "Id"] as number;
          result[expand] =
            ds[expandModel][
            ds[expandModel].findIndex((d: { id: number }) => d.id === expandId)
            ];
        }
      } else {
        result = ds[model].map((m: { [x: string]: TODO }) => {
          if (expandModel) {
            expand =
              expandModel === "categories"
                ? "category"
                : expandModel.substr(0, expandModel.length - 1);
            expandId = m[expand + "Id"] as number;
            m[expand] =
              ds[expandModel][
              ds[expandModel].findIndex((d: { id: number }) => d.id === expandId)
              ];
          }
          return m;
        });
      }
    }
    setTimeout(resolve, 300, { data: result });
  });
}

export function postData(action: string, data: Entity): Promise<TODO> {
  const { model } = parseRequest(action)
  return new Promise(function (resolve, _reject) {
    ds[model].push(data);
    setTimeout(resolve, 300, { data: data });
  });
}

export function putData(action: string, data: Entity): Promise<TODO> {
  const { model, id } = parseRequest(action)
  return new Promise(function (resolve, _reject) {
    const idx = ds[model].findIndex((d: { id: number }) => d.id === id);
    ds[model][idx] = Object.assign({}, data);
    setTimeout(resolve, 300, { data: data });
  });
}

export function deleteData(action: string): Promise<TODO> {
  const { model, id } = parseRequest(action)
  return new Promise(function (resolve, _reject) {
    if (id > 0) {
      ds[model].splice(ds[model].findIndex((d: Entity) => d.id === id), 1);
    }
    setTimeout(resolve, 300, { data: id });
  });
}

export function login(action: string, _method: HttpMethod, data: TODO): Promise<TODO> {
  return new Promise(function (resolve, _reject) {
    if (data.username === "admin@test.com" && data.password === "password") {
      const { accessToken: accessToken, user } = ds.token;
      setTimeout(resolve, 300, {
        // data: {
        token: accessToken,
        user,
        // },
      });
    } else {
      _reject({
        code: 403,
        error: "Your name or password is wrong",
      });
    }
  });
}

export function callApi(endpoint, method: HttpMethod, data?: TODO, filters?: TODO) {
  switch (method) {
    case HttpMethod.GET:
      return getData(endpoint, filters);
    case HttpMethod.PUT:
      return putData(endpoint, data);
    case HttpMethod.POST:
      return postData(endpoint, data)
    case HttpMethod.DELETE:
      return deleteData(endpoint)
    default:
      return null;

  }

}

export const CALL_API = Symbol("Call API");



// export default store => next => action => {

//   const callAPI = action[CALL_API];

//   // So the middleware doesn't get applied to every single action
//   if (typeof callAPI === "undefined") {
//     // Reset type action
//     if (action.type) return next({ type: action.type });
//     return next(action);
//   }

//   const { types, authenticated, method, data, filters } = callAPI;
//   let endpoint = callAPI.endpoint;

//   if (typeof endpoint === "function") {
//     endpoint = endpoint(store.getState());
//   }

//   if (typeof endpoint !== "string") {
//     throw new Error("Specify a string endpoint URL.");
//   }

//   if (!Array.isArray(types) || types.length !== 3) {
//     throw new Error("Expected an array of three action types.");
//   }

//   if (!types.every(type => typeof type === "string")) {
//     throw new Error("Expected action types to be strings.");
//   }

//   const [requestType, successType, errorType] = types;

//   // Passing the authenticated boolean back in our data will let us distinguish between normal and secret quotes
//   return callApi(endpoint, method, data, filters).then(
//     response =>
//       next({
//         response,
//         authenticated,
//         filters: filters,
//         type: successType
//       }),
//     error =>
//       next({
//         error: error,
//         type: errorType
//       })
//   );
// };
