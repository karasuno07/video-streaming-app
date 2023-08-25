import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';

import styles from './menu.module.scss';

const cx = classNames.bind(styles);

type ClickableElementProps = React.HTMLProps<HTMLElement> & {
  onClick?: (..._args: any) => void;
};

interface MenuProps extends React.HTMLProps<HTMLDivElement> {
  classes?: {
    menuClassName: string;
    menuListClassName: string;
    menuItemClassName: string;
  };
  position?: 'left' | 'right';
  hover?: boolean;
  items: React.ReactElement[];
  children: React.ReactElement;
}

function Menu({
  classes,
  position,
  items,
  hover,
  children,
  ...componentProps
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [show, setShow] = useState<boolean>(false);

  const inboundOnClickHandler = () => {
    setShow((prevState) => !prevState);
  };

  const outboundOnClickHandler = (evt: MouseEvent) => {
    const target = evt.target as Node;
    if (!menuRef.current?.contains(target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (!hover) {
      document.addEventListener('click', outboundOnClickHandler);
    } else {
      document.removeEventListener('click', outboundOnClickHandler);
    }

    return () => {
      document.removeEventListener('click', outboundOnClickHandler);
    };
  }, [hover]);

  const mappedPropsChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as ClickableElementProps;
      const props: ClickableElementProps = {
        ...childProps,
        className: cx(childProps.className, 'cursor-pointer'),
        onClick: !hover ? inboundOnClickHandler : undefined,
      };
      return React.cloneElement(child, props);
    }
    return child;
  });

  return (
    <div
      ref={menuRef}
      className={cx('root', classes?.menuClassName, { hover })}
      {...componentProps}
    >
      {mappedPropsChildren}
      <ul
        ref={listRef}
        className={cx('menu-list', classes?.menuListClassName, {
          visible: show,
          'position-left': position === 'left',
          'position-right': position === 'right',
        })}
      >
        {items.map((item, idx) => {
          return (
            <li
              key={idx}
              className={cx('menu-item', classes?.menuItemClassName)}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Menu;
