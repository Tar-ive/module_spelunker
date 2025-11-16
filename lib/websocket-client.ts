/**
 * WebSocket client with auto-reconnect and exponential backoff
 */

type ConnectionState = 'connecting' | 'waking' | 'connected' | 'disconnected' | 'error'

interface WebSocketMessage {
  type: 'waking' | 'ready' | 'stdout' | 'stderr' | 'error' | 'complete'
  message?: string
  line?: string
}

interface WebSocketClientOptions {
  url: string
  onMessage: (message: WebSocketMessage) => void
  onStateChange: (state: ConnectionState) => void
  maxReconnectAttempts?: number
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private reconnectTimeout: NodeJS.Timeout | null = null
  private shouldReconnect = true
  
  constructor(private options: WebSocketClientOptions) {
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5
  }
  
  connect() {
    this.options.onStateChange('connecting')
    
    try {
      this.ws = new WebSocket(this.options.url)
      
      this.ws.onopen = () => {
        console.log('✓ WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          
          // Update connection state based on message type
          if (data.type === 'waking') {
            this.options.onStateChange('waking')
          } else if (data.type === 'ready') {
            this.options.onStateChange('connected')
          }
          
          this.options.onMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.options.onStateChange('error')
      }
      
      this.ws.onclose = () => {
        console.log('✗ WebSocket disconnected')
        this.options.onStateChange('disconnected')
        if (this.shouldReconnect) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.options.onStateChange('error')
      if (this.shouldReconnect) {
        this.attemptReconnect()
      }
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      this.options.onStateChange('error')
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }
  
  send(command: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ command }))
    } else {
      console.error('WebSocket not connected')
    }
  }
  
  disconnect() {
    this.shouldReconnect = false
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
