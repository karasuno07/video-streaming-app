'use client';

import Button from '@components/elements/Button';
import Icon from '@components/elements/Icon';
import Menu from '@components/elements/Menu';
import servers, { SupportedServer } from '@features/video/constants/server';
import { Link } from '@lib/navigation';
import classNames from 'classnames/bind';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaLightbulb, FaRegLightbulb } from 'react-icons/fa6';
import { DiscoverType } from 'types/tmdb/api';
import styles from './Player.module.scss';
import ServerList from './ServerList';

const cx = classNames.bind(styles);

type Season = {
  seasonNumber: number;
  name: string;
  episodes: number;
};

type Props = {
  type: DiscoverType;
  id: number;
  name: string;
  seasons?: Season[];
};

export default function Player({ type, id, name, seasons = [] }: Props) {
  const translate = useTranslations('pages.video.play');

  const frameRef = useRef<HTMLIFrameElement>(null);
  const switchLightRef = useRef<HTMLButtonElement>(null);
  const [videoServer, setVideoServer] = useState<SupportedServer>('Vidsrc.to');
  const [season, setSeason] = useState<Season | undefined>(seasons[0]);
  const [episode, setEpisode] = useState<number>(1);
  const [lightStatus, switchLight] = useState<boolean>(true);

  const server = servers.find((s) => s.name === videoServer) || servers[0];

  const buildVideoSrc = () => {
    if (type === 'tv') {
      return server.link({ type, id, seasonId: season?.seasonNumber || 1, episodeId: episode });
    }
    return server.link({ type, id });
  };

  const onChangeServerHandler = (serverName: SupportedServer) => setVideoServer(serverName);

  const onChangeSeasonHandler = (seasonNumber: number) => {
    const _season = seasons.find((s) => s.seasonNumber === seasonNumber);
    setSeason(_season);
  };

  const onChangeEpisodeHandler = (episodeId: number) => {
    if (season && episodeId > season.episodes) {
      setEpisode(season.episodes);
    } else {
      setEpisode(episodeId);
    }
  };

  function handleIframeOutboundClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (!frameRef.current?.contains(target) && !switchLightRef.current?.contains(target)) {
      switchLight(true);
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleIframeOutboundClick);

    return () => {
      document.removeEventListener('click', handleIframeOutboundClick);
    };
  }, []);

  useEffect(() => {
    document.querySelector('main')?.classList.toggle('theater', !lightStatus);
  }, [lightStatus]);

  return (
    <div className={cx('root')}>
      <div className={cx('head')}>
        <h1 className={cx('title')}>
          {translate.rich('title', {
            name,
            link: (chunks) => (
              <Link className={cx('link')} href={`/${type}/${id}/info`}>
                {chunks}
              </Link>
            ),
          })}
        </h1>

        <div className={cx('tool')}>
          <Button ref={switchLightRef} onClick={() => switchLight((prevStatus) => !prevStatus)}>
            <Icon icon={lightStatus ? FaLightbulb : FaRegLightbulb} size={20} />
            <span>
              {translate('theaterMode')}
              <b>{lightStatus ? 'OFF' : 'ON'}</b>
            </span>
          </Button>
          {type == 'tv' && seasons && season && (
            <>
              <Menu
                anchor={
                  <Button className='flex items-center'>
                    <span>{translate('season', { number: season.seasonNumber })}</span>
                    <Icon icon={FaChevronDown} size={12} />
                  </Button>
                }
                items={seasons.map((s) => (
                  <li
                    key={s.seasonNumber}
                    onClick={onChangeSeasonHandler.bind(null, s.seasonNumber)}
                  >
                    {translate('season', { number: s.seasonNumber })}
                  </li>
                ))}
                classes={{
                  menuListClassName: cx('dropdown'),
                  menuItemClassName: cx('item'),
                }}
                position='right'
              />
              <Menu
                anchor={
                  <Button className='flex items-center'>
                    <span>{translate('episode', { number: episode })}</span>
                    <Icon icon={FaChevronDown} size={12} />
                  </Button>
                }
                items={Array(season.episodes)
                  .fill(1)
                  .map((_, idx) => (
                    <li key={idx} onClick={onChangeEpisodeHandler.bind(null, idx + 1)}>
                      {translate('episode', { number: idx + 1 })}
                    </li>
                  ))}
                classes={{
                  menuListClassName: cx('dropdown'),
                  menuItemClassName: cx('item'),
                }}
                position='right'
              />
            </>
          )}
        </div>
      </div>
      <iframe
        ref={frameRef}
        className={cx({ 'up-front': !lightStatus })}
        src={buildVideoSrc()}
        allowFullScreen
      />
      <ServerList current={videoServer} onChangeServer={onChangeServerHandler} />
    </div>
  );
}