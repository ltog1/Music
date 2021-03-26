import axios from 'axios'

// 获取歌手列表
export function getSingerList() {
  const url = '/api/getSingerList';
  const params = Object.assign({}, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  });

  return axios.get(url, {
    params
  }).then(res => {
    if (res.code === 0) {
      return res.data;
    }
  })
}

// 获取歌手列表详情
export function getSingerDetail(singerId) {
  const url = '/api/getSingerDetail'
  const params = Object.assign({}, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerId
  });

  return axios.get(url, {
    params
  }).then(res => {
    if (res.code === 0) {
      return res.data;
    }
  })
}