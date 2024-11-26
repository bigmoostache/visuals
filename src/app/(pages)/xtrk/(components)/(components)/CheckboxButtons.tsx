import { Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";

const configuration = {
  colors: [
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-lime-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-yellow-500",
  ],
};

interface SelectProps {
  options: string[];
  onChange: (option: string | null) => void;
  currentSelection: string | null;
}

const Select = ({ options, onChange, currentSelection }: SelectProps) => {
  const [selectedOption, setSelectedOption] = useState(currentSelection);

  const handleToggle = (option: string) => {
    const isSelected = selectedOption === option;
    if (isSelected) {
      return;
    }
    const newSelectedOption = isSelected ? null : option;

    setSelectedOption(newSelectedOption);
    onChange(newSelectedOption);
  };

  return (
    <div className="w-full flex gap-2 flex-wrap text-gray-900">
      {options.map((option, index) => {
        const isChecked = selectedOption === option;
        return (
          <label
            className="flex self-start flex-col cursor-pointer"
            key={option}
          >
            <input
              type="checkbox"
              className="hidden"
              value={option}
              checked={isChecked}
              onChange={() => handleToggle(option)}
            />
            <div
              className={`${
                isChecked
                  ? configuration.colors[index % configuration.colors.length]
                  : "bg-gradient-to-bl from-gray-100 to-gray-200 hover:ring-2 hover:ring-offset-2 hover:ring-gray-700"
              } ${
                isChecked ? "text-white pr-2 pl-7" : "px-2"
              } rounded-md flex gap-2 items-center transition-all transform duration-200 overflow-hidden`
            }
            >
              <Transition appear show={isChecked} as={Fragment}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="scale-0 -left-5"
                  enterTo="scale-100 left-2"
                  leave="ease-in duration-200"
                  leaveFrom="scale-100 left-2"
                  leaveTo="scale-0 -left-5"
                >
                  <CheckIcon
                    className="h-4 w-4 absolute left-2"
                    aria-hidden="true"
                  />
                </Transition.Child>
              </Transition>
              <span className="select-none flex h-full">
                <span className="my-1">{option}</span>
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default Select;