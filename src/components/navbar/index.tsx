'use client';

import SearchBar from '@components/Navbar/SearchBar';
import UserInfo from '@components/Navbar/UserInfo';
import Button from '@components/elements/Button';
import Divider from '@components/elements/Divider';
import Icon from '@components/elements/Icon';
import Menu from '@components/elements/Menu';
import useSession from '@features/authentication/hooks/useSession';
import { default as defaultUser } from '@icons/user-default-64.png';
import classNames from 'classnames/bind';
import { capitalize, isEmpty } from 'lodash';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser } from 'react-icons/fa6';
import { IoLogOut } from 'react-icons/io5';
import styles from './Navbar.module.scss';

const cx = classNames.bind(styles);

type Props = {};

function NavBar({}: Props) {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const translate = useTranslations('components.navBar');
  const userImage = session?.user?.image || defaultUser;

  const preventDragAndDropEventHandler = (evt: React.DragEvent<HTMLImageElement>) => {
    evt.preventDefault();
  };

  return (
    <nav className={cx('root')}>
      <div className={cx('container')}>
        <Link className={cx('logo')} href='/'></Link>
        <SearchBar />
        <div className={cx('auth-container')}>
          <div className={cx('flex justify-center items-center gap-4')}>
            {isEmpty(session) ? (
              <Button variant='success' onClick={() => router.push('/sign-in', { locale })}>
                <Icon icon={FaUser} size={18} />
                <span>{translate('signInBtn')}</span>
              </Button>
            ) : (
              <>
                <Menu
                  hover
                  position='right'
                  anchor={
                    <Image
                      className='rounded-full border border-gray-700'
                      src={userImage}
                      alt='user-avatar'
                      width={40}
                      height={40}
                      onDragStart={preventDragAndDropEventHandler}
                      onDrop={preventDragAndDropEventHandler}
                    />
                  }
                  items={[
                    <UserInfo
                      key='user-info'
                      username={capitalize(session.user.name)}
                      email={session.user.email}
                      icon={userImage}
                      tooltipPosition='left'
                    />,
                    <Divider key='divider-01' />,
                    <Button
                      fullSize
                      key={'sign-out'}
                      variant='danger'
                      onClick={() => router.push('/sign-out', { locale })}
                    >
                      <Icon icon={IoLogOut} size={20} />
                      <span>{translate('signOutBtn')}</span>
                    </Button>,
                  ]}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
