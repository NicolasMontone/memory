'use client'

import { useChat } from '@ai-sdk/react'
import { Plus, Send } from 'lucide-react'
import { use, useEffect, useMemo } from 'react'
import Markdown from 'react-markdown'

export default function Chat ({
  searchParams
}: {
  searchParams: Promise<{ permissionToken: string }>
}) {
  const initialMessages = useMemo(() => {
    if (typeof localStorage !== 'undefined') {
      const messages = localStorage.getItem('messages')
      return messages ? JSON.parse(messages) : []
    }
    return []
  }, [])
  const sp = use(searchParams)
  const permissionToken = sp.permissionToken

  const { messages, input, handleInputChange, handleSubmit, status, reload } =
    useChat({
      api: '/api/chat',
      headers: {
        permissionToken
      },
      initialMessages
    })

  useEffect(() => {
    if (permissionToken) {
      reload()
    }
  }, [permissionToken, reload])

  useEffect(() => {
    if (status === 'ready') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('messages', JSON.stringify(messages))
      }
    }
  }, [messages, status])

  return (
    <div className='flex flex-col h-screen bg-gray-900'>
      {/* New Chat Button */}
      <div className='p-4 flex justify-end'>
        <button
          onClick={() => {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('messages')
              window.location.href = '/chat'
            }
          }}
          className='bg-gray-800 text-gray-300 hover:text-white rounded-full p-2 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
          aria-label='Start new chat'
        >
          <Plus className='w-5 h-5' />
        </button>
      </div>

      {/* Messages Container */}
      <div className='flex-1 overflow-y-auto p-4 space-y-6'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2'>
                <span className='text-gray-300 text-sm'>AI</span>
              </div>
            )}
            <div className='flex flex-col gap-2 max-w-[80%]'>
              <div
                className={`max-w-full rounded-2xl pt-2 pb-4 px-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <Markdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} className='text-blue-500'>
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className='mb-2'>{children}</p>,
                    h3: ({ children }) => (
                      <h3 className='text-lg font-bold mb-2'>{children}</h3>
                    ),
                    h2: ({ children }) => (
                      <h2 className='text-xl font-bold mb-2'>{children}</h2>
                    ),
                    ul: ({ children }) => (
                      <ul className='list-disc pl-5 mb-4'>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className='list-decimal pl-5 mb-4'>{children}</ol>
                    ),
                    li: ({ children }) => <li className='mb-2'>{children}</li>,
                    code: ({ children }) => (
                      <code className='bg-gray-900 text-white p-1 rounded-md'>
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className='border-l-2 border-gray-300 pl-4 py-2 my-4'>
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <table className='w-full border-collapse border border-gray-700'>
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th className='bg-gray-800 text-white p-2'>{children}</th>
                    ),
                    td: ({ children }) => <td className='p-2'>{children}</td>
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
              {message.role === 'assistant' &&
                message.parts.some(
                  part =>
                    part.type === 'tool-invocation' &&
                    part.toolInvocation.state === 'result' &&
                    'redirectUrl' in part.toolInvocation.result
                ) && (
                  <div className='max-w-[300px] bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 mt-2'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='text-center'>
                        <h3 className='font-medium text-gray-100'>
                          Permission Request
                        </h3>
                        <p className='text-sm text-gray-300 mt-1'>
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
                        <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer'>
                          Grant Access
                        </button>
                      </a>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
        {status === 'streaming' && (
          <div className='flex justify-start items-center'>
            <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2'>
              <span className='text-gray-300 text-sm'>AI</span>
            </div>
            <div className='bg-gray-800 rounded-2xl p-4 shadow-sm'>
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
        className='border-t border-gray-800 bg-gray-900 p-4'
      >
        <div className='flex items-center space-x-2 max-w-4xl mx-auto'>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder='Type a message...'
            className='flex-1 rounded-full bg-gray-800 text-gray-100 border-none px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 placeholder-gray-400'
            disabled={status === 'streaming'}
            aria-label='Message input'
          />
          <button
            type='submit'
            disabled={status === 'streaming' || !input.trim()}
            className='bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            aria-label='Send message'
          >
            <Send className='w-5 h-5' />
          </button>
        </div>
      </form>
    </div>
  )
}
