'use client'

import { useChat } from '@ai-sdk/react'
import { Send } from 'lucide-react'
import { use } from 'react'

export default function Chat ({
  searchParams
}: {
  searchParams: Promise<{ permissionToken: string }>
}) {
  const sp = use(searchParams)
  const permissionToken = sp.permissionToken

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    headers: {
      permissionToken
    }
  })

  console.log('messages', messages)

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm p-4'>
        <h1 className='text-xl font-semibold text-gray-800'>Memory Chat</h1>
      </header>

      {/* Messages Container */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => {
          console.log(
            'message',
            message.role === 'assistant' &&
              message.parts.some(
                part =>
                  part.type === 'tool-invocation' &&
                  part.toolInvocation.state === 'result' &&
                  'redirectUrl' in part.toolInvocation.result
              )
          )
          return (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className='flex flex-col gap-2 max-w-[80%]'>
                <div
                  className={`max-w-full rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className='text-sm'>{message.content}</p>
                </div>
                {message.role === 'assistant' &&
                  message.parts.some(
                    part =>
                      part.type === 'tool-invocation' &&
                      part.toolInvocation.state === 'result' &&
                      'redirectUrl' in part.toolInvocation.result
                  ) && (
                    <div className='max-w-[300px] bg-white rounded-lg p-4 shadow-md border border-gray-200 mt-2'>
                      <div className='flex flex-col items-center gap-3'>
                        <div className='text-center'>
                          <h3 className='font-medium text-gray-800'>
                            Permission Request
                          </h3>
                          <p className='text-sm text-gray-600 mt-1'>
                            {
                              (
                                message.parts.find(
                                  part =>
                                    part.type === 'tool-invocation' &&
                                    part.toolInvocation.state === 'result' &&
                                    'redirectUrl' in part.toolInvocation.result
                                ) as {
                                  toolInvocation: {
                                    args: {
                                      query: string
                                    }
                                  }
                                }
                              ).toolInvocation.args.query
                            }
                          </p>
                        </div>
                        <a
                          href={
                            (
                              message.parts.find(
                                part =>
                                  part.type === 'tool-invocation' &&
                                  part.toolInvocation.state === 'result' &&
                                  'redirectUrl' in part.toolInvocation.result
                              ) as {
                                toolInvocation: {
                                  result: {
                                    redirectUrl: string
                                  }
                                }
                              }
                            ).toolInvocation.result.redirectUrl
                          }
                          className='w-full'
                          aria-label='Grant permission access'
                        >
                          <button className='w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer'>
                            Grant Access
                          </button>
                        </a>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )
        })}
        {status === 'streaming' && (
          <div className='flex justify-start'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='flex space-x-2'>
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100' />
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200' />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className='border-t border-gray-200 bg-white p-4'
      >
        <div className='flex items-center space-x-2'>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder='Type your message...'
            className='flex-1 rounded-lg border text-black border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            disabled={status === 'streaming'}
            aria-label='Message input'
          />
          <button
            type='submit'
            disabled={status === 'streaming' || !input.trim()}
            className='bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='Send message'
          >
            <Send className='w-5 h-5' />
          </button>
        </div>
      </form>
    </div>
  )
}
