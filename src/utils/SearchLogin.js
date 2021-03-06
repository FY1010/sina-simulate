import axios from './axios'
import { reactive, effect } from './reactive'
import { show } from './showToast'

// 引入图标
import anonymous from '../../imgs/anonymous.png'
import commentsIcon from '../../imgs/comments.png'
import thumbIcon from '../../imgs/thumb.png'
import searchIcon from '../../imgs/search-icon.png'
import searchIconActive from '../../imgs/search-icon1.png'
import successImg from '../../imgs/success.png'
import loading from '../../imgs/loading.gif'
import err from '../../imgs/err.png'
import emoji from '../../imgs/emoji.png'
import keep from '../../imgs/keep.png'
import shareIcon from '../../imgs/share.png'
class Searching {
  constructor(method, url) {
    this.$search = document.querySelector('.search-input')
    this.$show = document.querySelector('.search-dragdown')
    this.mehod = method,
      this.url = url,
      this.onTyping()
    this.btnEvent()
  }
  // 基础防抖 **
  onTyping() {
    let timer //定时器
    this.$search.addEventListener('keyup', ({ target }) => {
      if (timer)
        clearTimeout(timer);
      timer = setTimeout(() => {
        const that = this
        axios.get('/article/pageQuery', { cid: '', currentPage: '', aword: this.$search.value })
          .then(
            res => {
              that.refresh(res.list)
            }
          )
        // this.refresh(baseData.searching)
      }, 500)
    }),
      this.$search.addEventListener('blur', ({ target }) => {
        if (!this.focus)
          this.$show.classList.add("hide")
      }),
      this.$search.addEventListener('focus', ({ target }) => {
        this.$show.classList.remove("hide")
        const that = this
        axios.get('/article/findHotArticle')
          .then(
            res => {
              that.refresh(res)
            }
          )
      })
    this.$show.onmouseover = () => { this.focus = true }
    this.$show.onmouseout = () => { this.focus = false }

    const btn = document.getElementsByClassName('search-icon-div')[0]
    btn.onclick = () => {
      axios.get(`/article/pageQuery`, { aword: this.$search.value }).then(
        res => {
          window.open('./search.html?aword='+this.$search.value)
        },
        err => {
          show('搜索失败了 ' + err)
        }
      )
    }
  }
  refresh(res) {
    this.$show.innerHTML = `<div style="color:#eb7350" class="li">查看完整热搜榜》</div>`
    res.forEach((data, i) => {
      const div = document.createElement('div')
      const round = document.createElement('span')
      round.innerHTML = i + 1
      round.classList.add('round')
      div.appendChild(round)
      const span = document.createElement('span')
      span.innerHTML = data.aword
      div.appendChild(span)
      if (data.isHot) {
        const hotTag = document.createElement('span')
        hotTag.classList.add('hot-tag')
        hotTag.classList.add('center')
        hotTag.innerHTML = '热'
        div.appendChild(hotTag)
      }
      div.onclick = e => {
        window.open('./detail.html?aid='+data.aid)
      }
      div.classList.add('li')
      this.$show.appendChild(div)
    })
  }
  btnEvent() {
    let userInfo
    const $log = document.getElementsByClassName('log-reg')[0]
    const $login = document.getElementsByClassName('log-reg')[0]
    const $user = document.getElementsByClassName('show-info')[0]
    const $username = $user.getElementsByClassName('user')[0]
    const $exit = document.getElementsByClassName('exit')[0]
    if (localStorage.getItem('userInfo')) {
      userInfo = JSON.parse(localStorage.getItem('userInfo'))
      $username.innerText = userInfo.username

      $user.onclick = () => {
        console.log('user点击');
        window.open('./user.html')
      }
      $log.classList.add('hide')
      $login.classList.add('hide')

      $user.classList.remove('hide')

      $exit.onclick = onClick
      function onClick(e) {
        e.stopPropagation()
        $exit.onclick = null
        console.log('exit点击');
        axios.post('/user/exit', {}).then(
          value => {
            localStorage.removeItem('userInfo')
            window.open('./search.html', '_self')
          },
          err => {
            show('注销失败', 'fail')
          }
        ).finally(() => {
          $exit.onclick = onClick
        })
      }
    } else {
      $user.classList.add('hide')
      $log.classList.remove('hide')
    }

    // 鼠标移入搜索图标变色
    const $search = document.getElementsByClassName('search-icon')[0]
    $search.onmouseover = () => {
      $search.src = searchIconActive
    }
    $search.onmouseout = () => {
      $search.src = searchIcon
    }
    // 点击搜索
    $search.onclick = () => {
      // axios
      axios.get(`/article/pageQuery`, { aword: this.$search.value }).then(
        res => {
          contentList.fresh(res.list)
          contentList.addEvents(this.$search.value)
        },
        err => {
          show('搜索失败了 ' + err)
        }
      )
    }
  }
}

class Login$Register {
  constructor(method, url, data = {}) {
    this.mehod = method
    this.url = url
    this.data = data
    this.run()
  }
  // 移入移出变色，点击弹出登录窗口
  run() {
    const that = this
    const $login = document.querySelector('.login')
    const $register = document.querySelector('.register')
    // 移入变色
    $register.onmouseover = $login.onmouseover = function () {
      this.style.color = '#eb7350'
    }
    $login.onmouseout = $register.onmouseout = function () {
      this.style.color = '#6e6e6e'
    }
    // 点击事件
    $login.onclick = $register.onclick = function () {
      that.showToast(this.className)
    }

  }
  // 登陆注册弹出面板的字体切换大小，按钮内容切换，注册登陆切换，取消注册面板
  showToast(type) {
    const $toast = document.getElementsByClassName('toast')[0]
    const $log = document.getElementsByClassName('log')[0]
    const $reg = document.getElementsByClassName('reg')[0]
    const $main = document.getElementsByClassName('main')[0]
    const $mask = document.getElementsByClassName('cover')[0]
    const $cancelBtn = document.getElementsByClassName('cancel-log')[0]
    const $btn = document.getElementsByClassName('log-btn')[0]

    $mask.classList.remove('hide')
    // 初始化益处登陆或者注册字体变大
    $reg.classList.remove('active')
    $log.classList.remove('active')

    $main.classList.add('blur')
    $toast.classList.remove('hide')
    let observed = reactive({
      type: type
    })
    effect(() => {
      $btn.innerHTML = observed.type == 'login' ? '登陆' : '注册'
      if (observed.type == 'login') {
        $log.classList.add('active')
        $reg.classList.remove('active')
      } else {
        $reg.classList.add('active')
        $log.classList.remove('active')
      }
    })

    $log.onclick = $reg.onclick = function () {
      observed.type = this.className.indexOf('log') == -1 ? 'register' : 'login'
    }
    $mask.onclick = $cancelBtn.onclick = () => {
      $toast.classList.add('hide')
      $mask.classList.add('hide')
      $main.classList.remove('blur')
    }
    this.typing()
  }
  // 输入时的提示信息警告信息等，登陆注册按钮的隐藏显示和点击
  typing() {
    let timer = []
    const $toast = document.getElementsByClassName('form-content')[0]
    const spans = $toast.getElementsByTagName('span')
    const imgs = document.getElementsByClassName('state-img')
    const $inputs = $toast.getElementsByClassName('input')
    const $btn = document.getElementsByClassName('log-btn')[0]

    // 获取提示状态的图片
    let errMsg = ''
    // 每个输入框是否输入完成，
    const isFinish = reactive({
      value: Array(5).fill(0)
    })
    // 时刻检测按钮的隐藏和显示
    effect(() => {
      if ((isFinish.value.indexOf(0) == -1) || ($btn.innerHTML == '登陆' && isFinish.value[0] == 1 && isFinish.value[1] == 1))
        $btn.classList.remove('hide')
      else
        $btn.classList.add('hide')
    })

    Array.prototype.forEach.call($inputs, (input, i) => {
      input.addEventListener('keyup', e => {
        imgs[i].src = loading
        clearTimeout(timer[i])
        timer[i] = setTimeout(() => {
          errMsg = this.check(i, e.target.value)
          if (errMsg) {
            imgs[i].src = err
            isFinish.value[i] = 0
          } else {
            imgs[i].src = successImg
            isFinish.value[i] = 1
          }
          spans[i].innerHTML = errMsg
        }, 300)
      })
    })

    $btn.onclick = () => {
      let phone = $inputs[0].value
      let password = $inputs[1].value
      let username = $inputs[3].value
      let mail = $inputs[4].value

      const img = document.createElement('img')
      img.src = loading
      if ($btn.innerHTML === '登陆') {
        // axios this.method...
        axios.post('/user/login', {
          telephone: phone,
          password
        }).then(
          res => {
            if (!res.flag) {
              return Promise.reject(res.errorMsg)
            } else {
              return axios.post('/user/findLoginUser', {})
            }
          }, err => {
            return Promise.reject(err)
          }
        ).then(
          res => {
            if (res) {
              localStorage.setItem('userInfo', JSON.stringify(res))
              window.open('./user.html', '_self')
            }
          },
          err => {
            show('登陆失败 ' + err, 'fail')
          }
        ).finally(
          () => {
            $btn.removeChild(img)
            $btn.onclick = clickEvent
          }
        )
      } else {
        // axios this.method...
        axios.post('/user/register', {
          telephone: phone,
          password,
          username,
          email: mail
        }).then(res => {
          show('注册成功， 请登陆')
          $btn.removeChild(img)
        }, err => {
          show('注册失败，请检查网络\n' + err, 'fail');
          $btn.removeChild(img)

        })
      }
      $btn.appendChild(img)
    }
  }
  // 输入form表单的检测
  check(type, value) {
    let errMsg = ''
    switch (type) {
      // 手机号
      case 0:
        {
          const reg = /^1[3456789]\d{9}$/
          const result = reg.test(value)
          if (!result) {
            if (/^[\u0391-\uFFE5]+$/.test(value))
              errMsg = '不懂什么是手机号?'
            else if (/^[a-zA-Z_]+$/.test(value))
              errMsg = '你家手机号英文呐？'
            else if (value.length != 11)
              errMsg = '手机号长度错误'
            else
              errMsg = '输入有误'
          }
          break;
        }
      // 密码
      case 1:
        {
          if (value == '')
            errMsg = '输入为空'
          break;
        }
      // 确认密码
      case 2:
        {
          const password = document.getElementsByClassName('password')[0].value
          if (value.length == 0)
            errMsg = '输入为空'
          if (value != password)
            errMsg = '两次密码不一样'
          break;
        }
      // 用户名
      case 3:
        {
          if (value.length == 0)
            errMsg = '输入为空'
          break;
        }
      // 邮箱
      case 4:
        {
          const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
          const result = reg.test(value)
          if (!result)
            errMsg = '输入有误'
          break;
        }
      default:
        {
          throw new Error('输入类型错误');
        }
    }
    return errMsg
  }
}

export {
  Searching,
  Login$Register
}