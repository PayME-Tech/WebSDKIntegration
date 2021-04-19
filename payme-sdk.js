class PaymeWebSdk {
  ERROR_CODE = {
    EXPIRED: 401,
    NETWORK: -1,
    SYSTEM: -2,
    LITMIT: -3,
    ACCOUNT_NOT_ACTIVITIES: -4,
    ACCOUNT_NOT_KYC: -5,
    PAYMENT_ERROR: -6,
    ERROR_KEY_ENCODE: -7,
    USER_CANCELLED: -8,
    NOT_LOGIN: -9
  }

  WALLET_ACTIONS = {
    LOGIN: 'LOGIN',
    GET_WALLET_INFO: 'GET_WALLET_INFO',
    GET_ACCOUNT_INFO: 'GET_ACCOUNT_INFO',
    OPEN_WALLET: 'OPEN_WALLET',
    WITHDRAW: 'WITHDRAW',
    DEPOSIT: 'DEPOSIT',
    GET_LIST_SERVICE: 'GET_LIST_SERVICE',
    UTILITY: 'UTILITY',
    GET_LIST_PAYMENT_METHOD: 'GET_LIST_PAYMENT_METHOD',
    PAY: 'PAY'
  }

  ENV = {
    dev: "dev",
    sandbox: "sandbox",
    production: "production",
  }

  AccountStatus = {
    NOT_ACTIVED: 'NOT_ACTIVED',
    NOT_KYC: 'NOT_KYC',
    KYC_OK: 'KYC_OK'
  }

  constructor(settings) {
    this.configs = {}
    this.id = settings.id
    this.dimension = {
      width: settings.width,
      height: settings.height
    }
    this.domain = this.getDomain(configs.env)
    this._iframe = null

    window.onmessage = (e) => {
      if (e.data.type === this.WALLET_ACTIONS.LOGIN) {
        this.onCloseIframe()
        if (e.data?.data) {
          const newConfigs = {
            ...this.configs,
            ...e.data.data
          }
          this.configs = newConfigs
        }
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.GET_WALLET_INFO) {
        this.onCloseIframe()
        this.sendRespone(e.data)
      }
      if (e.data?.type === 'onClose') {
        document.getElementById(this.id).innerHTML = ''
        this.onCloseIframe()
      }
      if (e.data?.type === 'error') {
        if (e.data?.code === 401) {
          this.onCloseIframe()
        }
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.GET_ACCOUNT_INFO) {
        this.onCloseIframe()
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.GET_LIST_SERVICE) {
        this.onCloseIframe()
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.PAY) {
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.DEPOSIT) {
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.WITHDRAW) {
        this.sendRespone(e.data)
      }
      if (e.data?.type === this.WALLET_ACTIONS.GET_LIST_PAYMENT_METHOD) {
        this.onCloseIframe()
        this.sendRespone(e.data)
      }
    }
  }

  onCloseIframe() {
    this._iframe?.remove()
  }

  sendRespone(data) {
    if (data?.error) {
      if (this._onError) {
        this._onError(data?.error)
      }
      this._onError = null
    } else if (data?.code === 401) {
      if (this._onError) this._onError(data)
      this._onError = null
    } else {
      if (this._onSuccess) this._onSuccess(data)
      this._onSuccess = null
    }
  }

  getDomain(env) {
    switch (env) {
      case this.ENV.dev:
        return "http://localhost:3000"
      case this.ENV.sandbox:
        return "http://localhost:3000"
      case this.ENV.production:
        return "https://sdk.payme.com.vn"
      default:
        return "https://sbx-sdk.payme.com.vn"
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.onload = resolve
      script.onerror = reject
      script.src = src
      document.head.append(script)
    })
  }

  encrypt(text) {
    const secretKey = 'CMo359Lqx16QYi3x'
    return this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js')
      .then(() => {
        // eslint-disable-next-line no-undef
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(text), secretKey).toString()

        return encrypted
      })
      .catch((err) => console.error('Something went wrong.', err))
  }

  async createLoginURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.LOGIN,
      },
    }

    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }


  async createGetBalanceURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.GET_WALLET_INFO,
      },
    }

    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createOpenWalletURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.OPEN_WALLET,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createDepositURL(param) {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.DEPOSIT,
        amount: param.amount,
        description: param.description,
        extraData: param.extraData,
      },
    }

    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createWithdrawURL(param) {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.WITHDRAW,
        amount: param.amount,
        description: param.description,
        extraData: param.extraData,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createPayURL(param) {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.PAY,
        amount: param.amount,
        orderId: param.orderId,
        storeId: param.storeId,
        note: param.note
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createGetAccountInfoURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.GET_ACCOUNT_INFO,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createGetListServiceURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.GET_LIST_SERVICE,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createGetListPaymentMethodURL() {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.GET_LIST_PAYMENT_METHOD,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  async createOpenServiceURL(serviceCode) {
    const configs = {
      ...this.configs,
      actions: {
        type: this.WALLET_ACTIONS.UTILITY,
        serviceCode,
      },
    }
    const encrypt = await this.encrypt(configs)

    return this.domain + "/getDataWithAction/" + encodeURIComponent(encrypt)
  }

  openIframe(link) {
    let ifrm = document.createElement("iframe");
    this._iframe = ifrm

    ifrm.setAttribute(`src`, link);
    // ifrm.style.width = this.dimension.width;
    // ifrm.style.height = this.dimension.height;
    ifrm.style.width = this.dimension.width ? `${this.dimension.width}px` : '100%'
    ifrm.style.height = this.dimension.height ? `${this.dimension.height}px` : '100%'
    ifrm.style.position = 'absolute'
    ifrm.style.top = 0
    ifrm.style.left = 0
    ifrm.style.right = 0
    ifrm.style.bottom = 0
    ifrm.style.border = 0
    ifrm.allow = 'camera *'
    ifrm.referrerPolicy = 'origin-when-cross-origin'
    ifrm.allowpaymentrequest = true
    ifrm.allowFullscreen = true
    const element = document.getElementById(this.id);
    element && element.appendChild(ifrm);
  }

  hideIframe(link) {
    let div = document.createElement("div");
    let ifrm = document.createElement("iframe");
    this._iframe = ifrm

    div.style.visibility = 'hidden'
    div.style.display = 'block'
    div.style.width = 0
    div.style.height = 0

    ifrm.setAttribute(`src`, link);
    ifrm.style.width = 0
    ifrm.style.height = 0
    ifrm.style.border = 0
    const element = document.getElementById(this.id);
    div.appendChild(ifrm)
    element && element.appendChild(div);
  }

  async login(configs, onSuccess, onError) {
    const id = this.id
    this.configs = configs
    const iframe = await this.createLoginURL()
    this.hideIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async openWallet(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createOpenWalletURL()
    this.openIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async withdraw(configs, onSuccess, onError) {
    const id = this.id
    const iframe = await this.createWithdrawURL(configs)
    this.openIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async deposit(configs, onSuccess, onError) {
    const id = this.id
    const iframe = await this.createDepositURL(configs)
    this.openIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async pay(configs, onSuccess, onError) {
    const id = this.id
    const iframe = await this.createPayURL(configs)
    this.openIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async getBalance(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createGetBalanceURL()
    this.hideIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async getListService(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createGetListServiceURL()
    this.hideIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async getListPaymentMethod(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createGetListPaymentMethodURL()
    this.hideIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  async getAccountInfo(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createGetAccountInfoURL()
    this.hideIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError

  }

  async openService(onSuccess, onError) {
    const id = this.id
    const iframe = await this.createOpenServiceURL('HOCPHI')
    this.openIframe(iframe)

    this._onSuccess = onSuccess
    this._onError = onError
  }

  onMessage(onEvent) {
    window.onmessage = (e) => {
      onEvent(e.data);
    };
  }
}
