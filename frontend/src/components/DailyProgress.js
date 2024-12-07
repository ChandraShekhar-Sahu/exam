function DailyProgress() {
    return(
        <div className="flex-grow bg-white rounded-xl shadow-md px-6 py-4 flex flex-col items-end">
    <div className="text-xs font-semibold tracking-wide uppercase py-1 px-3 rounded-full"
        style={{ backgroundColor: 'rgb(123, 255, 253)', color: 'rgb(0, 119, 117)' }}>New</div>
    <div className="grid grid-cols-7 gap-1 flex-grow self-stretch">
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-4 mx-auto rounded-full" style={{ backgroundColor: 'rgb(123, 255, 253)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">M</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-16 mx-auto rounded-full" style={{ backgroundColor: 'rgb(0, 255, 244)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">T</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-24 mx-auto rounded-full" style={{ backgroundColor: 'rgb(0, 255, 244)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">W</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-32 mx-auto rounded-full" style={{ backgroundColor: 'rgb(0, 237, 219)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">T</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-20 mx-auto rounded-full" style={{ backgroundColor: 'rgb(0, 255, 244)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">F</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-10 mx-auto rounded-full" style={{ backgroundColor: 'rgb(123, 255, 253)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">S</div>
        </div>
        <div className="flex flex-col justify-end items-center">
            <div className="w-4 h-10 mx-auto rounded-full" style={{ backgroundColor: 'rgb(123, 255, 253)' }}></div>
            <div className="text-center text-xs text-gray-400 font-semibold mt-2">S</div>
        </div>
    </div>
</div>

    );
}