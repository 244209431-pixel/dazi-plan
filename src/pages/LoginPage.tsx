import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!account.trim() || !password.trim()) {
      setError('请输入账号和密码')
      return
    }

    setIsLoading(true)
    // 模拟加载延迟
    await new Promise(r => setTimeout(r, 500))

    const success = login(account.trim(), password)
    if (success) {
      navigate('/')
    } else {
      setError('账号或密码不正确')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-warm-50 to-white
                    flex flex-col items-center justify-center px-6">
      {/* 装饰背景 */}
      <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-48 h-48 bg-warm-200/30 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/2 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl" />
      </div>

      {/* Logo 区域 */}
      <div className="relative z-10 text-center mb-8 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-warm-400
                        rounded-[2rem] shadow-glow flex items-center justify-center
                        animate-bounce-soft">
          <span className="text-5xl">🎪</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-gradient mb-2">
          搭子计划
        </h1>
        <p className="text-sm text-gray-500">
          家庭遛娃搭子社群 · 一起探索成长
        </p>
      </div>

      {/* 小朋友装饰 */}
      <div className="relative z-10 flex items-center gap-2 mb-6 text-2xl">
        <span className="animate-bounce" style={{ animationDelay: '0s' }}>👦</span>
        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>👧</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🤝</span>
        <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>👦</span>
        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>👧</span>
      </div>

      {/* 登录表单 */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-sm card p-6 animate-slide-up"
      >
        <h2 className="text-lg font-semibold text-center mb-6 text-gray-800">
          欢迎回来 👋
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
              家庭账号
            </label>
            <input
              type="text"
              value={account}
              onChange={e => setAccount(e.target.value)}
              placeholder="输入家庭名称或账号"
              className="input-field"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
              密码
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="输入密码"
                className="input-field pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                开始探索
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          首次登录请联系超管获取家庭账号
        </p>
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => navigate('/invite')}
            className="text-xs text-primary-500 hover:text-primary-600 underline underline-offset-2"
          >
            还没有账号？申请加入 →
          </button>
        </div>
      </form>

      {/* 底部提示 */}
      <div className="relative z-10 mt-6 text-center">
        <p className="text-xs text-gray-400">
          默认超管账号：管理员家庭 / admin123
        </p>
      </div>
    </div>
  )
}
