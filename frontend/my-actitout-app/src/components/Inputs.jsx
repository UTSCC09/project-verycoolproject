import React from "react";

function InputComponent(props) {
    const { title, value, options, disabled, onChange } = props;
    const handleChange = (e) => {
        onChange(+e.target.value);
    };

    return (
        <>
            <label className="block font-bold text-sm mb-1">{title}</label>
            <select
                value={value}
                disabled={disabled}
                className="w-full rounded px-3 py-1 border border-gray-400 mb-3"
                onChange={handleChange}
            >
                {options.map((optionVal) => (
                    <option key={optionVal} value={optionVal}>
                        {optionVal}
                    </option>
                ))}
            </select>
        </>
    );
}
export default InputComponent;
