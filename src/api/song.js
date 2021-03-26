import axios from 'axios'
import { getUid } from 'common/js/uid'
import { commonParams } from './config'
import { Base64 } from 'js-base64'

// 获取歌曲url
export function getSongsUrl(songs) {
  const url = '/api/getPurlUrl';

  let mids = [];
  let types = [];
  songs.forEach(item => {
    mids.push(item.mid);
    types.push(0);
  });

  const urlMid = genUrlMid(mids,types);

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  });

  return new Promise((resolve, reject) => {
    let tryTime = 3

    function request () {
      return axios.post(url, {
        comm: data,
        req_0: urlMid
      }).then((response) => {
        const res = response
        if (res.code === 0) {
          let urlMid = res.req_0
          if (urlMid && urlMid.code === 0) {
            const purlMap = {}
            urlMid.data.midurlinfo.forEach((item) => {
              if (item.purl) {
                purlMap[item.songmid] = item.purl
              }
            })
            if (Object.keys(purlMap).length > 0) {
              resolve(purlMap)
            } else {
              retry()
            }
          } else {
            retry()
          }
        } else {
          retry()
        }
      })
    }

    function retry () {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Can not get the songs url'))
      }
    }

    request()
  })
}

function genUrlMid(mids,types) {
  const guid = getUid();
  return {
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}

// 获取歌词
export function getLyric(mid) {
  const url = '/api/getLyric';
  const params = Object.assign({}, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    format: 'json'
  });

  return axios.get(url, {
    params
  }).then(res => {
    if (res.code === 0) {
      return Base64.decode(res.lyric);
    }
  }).catch(e => {
    console.log(e);
  });
}
