import React from 'react'

const Loading = () => {
    return (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-white bg-opacity-50">
            <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-orange-600"></div>
        </div>
    )
}

export default Loading