import { FlexWrapper, Input } from '@affine/component';
import { pushNotificationAtom } from '@affine/component/notification-center';
import {
  SettingHeader,
  SettingRow,
  StorageProgress,
} from '@affine/component/setting-components';
import { Avatar } from '@affine/component/ui/avatar';
import { Button } from '@affine/component/ui/button';
import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import {
  allBlobSizesQuery,
  removeAvatarMutation,
  SubscriptionPlan,
  uploadAvatarMutation,
} from '@affine/graphql';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { ArrowRightSmallIcon, CameraIcon } from '@blocksuite/icons';
import bytes from 'bytes';
import { useSetAtom } from 'jotai';
import {
  type FC,
  type MouseEvent,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  authAtom,
  openSettingModalAtom,
  openSignOutModalAtom,
} from '../../../../atoms';
import { useCurrentUser } from '../../../../hooks/affine/use-current-user';
import { useSelfHosted } from '../../../../hooks/affine/use-server-config';
import { useMutation } from '../../../../hooks/use-mutation';
import { useQuery } from '../../../../hooks/use-query';
import { useUserSubscription } from '../../../../hooks/use-subscription';
import { validateAndReduceImage } from '../../../../utils/reduce-image';
import { Upload } from '../../../pure/file-upload';
import * as styles from './style.css';

export const UserAvatar = () => {
  const t = useAFFiNEI18N();
  const user = useCurrentUser();
  const pushNotification = useSetAtom(pushNotificationAtom);

  const { trigger: avatarTrigger } = useMutation({
    mutation: uploadAvatarMutation,
  });
  const { trigger: removeAvatarTrigger } = useMutation({
    mutation: removeAvatarMutation,
  });

  const handleUpdateUserAvatar = useAsyncCallback(
    async (file: File) => {
      try {
        const reducedFile = await validateAndReduceImage(file);
        await avatarTrigger({
          avatar: reducedFile, // Pass the reducedFile directly to the avatarTrigger
        });
        // XXX: This is a hack to force the user to update, since next-auth can not only use update function without params
        await user.update({ name: user.name });
        pushNotification({
          title: 'Update user avatar success',
          type: 'success',
        });
      } catch (e) {
        pushNotification({
          title: 'Update user avatar failed',
          message: String(e),
          type: 'error',
        });
      }
    },
    [avatarTrigger, pushNotification, user]
  );

  const handleRemoveUserAvatar = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      await removeAvatarTrigger();
      // XXX: This is a hack to force the user to update, since next-auth can not only use update function without params
      user.update({ name: user.name }).catch(console.error);
    },
    [removeAvatarTrigger, user]
  );

  return (
    <Upload
      accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
      fileChange={handleUpdateUserAvatar}
      data-testid="upload-user-avatar"
    >
      <Avatar
        size={56}
        name={user.name}
        url={user.image}
        hoverIcon={<CameraIcon />}
        onRemove={user.image ? handleRemoveUserAvatar : undefined}
        avatarTooltipOptions={{ content: t['Click to replace photo']() }}
        removeTooltipOptions={{ content: t['Remove photo']() }}
        data-testid="user-setting-avatar"
        removeButtonProps={{
          ['data-testid' as string]: 'user-setting-remove-avatar-button',
        }}
      />
    </Upload>
  );
};

export const AvatarAndName = () => {
  const t = useAFFiNEI18N();
  const user = useCurrentUser();
  const [input, setInput] = useState<string>(user.name);

  const allowUpdate = !!input && input !== user.name;
  const handleUpdateUserName = useCallback(() => {
    if (!allowUpdate) {
      return;
    }
    user.update({ name: input }).catch(console.error);
  }, [allowUpdate, input, user]);

  return (
    <SettingRow
      name={t['com.affine.settings.profile']()}
      desc={t['com.affine.settings.profile.message']()}
      spreadCol={false}
    >
      <FlexWrapper style={{ margin: '12px 0 24px 0' }} alignItems="center">
        <Suspense>
          <UserAvatar />
        </Suspense>

        <div className={styles.profileInputWrapper}>
          <label>{t['com.affine.settings.profile.name']()}</label>
          <FlexWrapper alignItems="center">
            <Input
              defaultValue={input}
              data-testid="user-name-input"
              placeholder={t['com.affine.settings.profile.placeholder']()}
              maxLength={64}
              minLength={0}
              style={{ width: 280, height: 32 }}
              onChange={setInput}
              onEnter={handleUpdateUserName}
            />
            {allowUpdate ? (
              <Button
                data-testid="save-user-name"
                onClick={handleUpdateUserName}
                className={styles.button}
                style={{
                  marginLeft: '12px',
                }}
              >
                {t['com.affine.editCollection.save']()}
              </Button>
            ) : null}
          </FlexWrapper>
        </div>
      </FlexWrapper>
    </SettingRow>
  );
};

const StoragePanel = () => {
  const t = useAFFiNEI18N();
  const isSelfHosted = useSelfHosted();

  const { data } = useQuery({
    query: allBlobSizesQuery,
  });

  const [subscription] = useUserSubscription();
  const plan = subscription?.plan ?? SubscriptionPlan.Free;

  // TODO(@JimmFly): get limit from user usage query directly after #4720 is merged
  const maxLimit = useMemo(() => {
    return bytes.parse(plan === SubscriptionPlan.Free ? '10GB' : '100GB');
  }, [plan]);

  const setSettingModalAtom = useSetAtom(openSettingModalAtom);
  const onUpgrade = useCallback(() => {
    setSettingModalAtom({
      open: true,
      activeTab: 'plans',
    });
  }, [setSettingModalAtom]);

  return (
    <SettingRow
      name={t['com.affine.storage.title']()}
      desc=""
      spreadCol={false}
    >
      <StorageProgress
        max={maxLimit}
        plan={plan}
        value={data.collectAllBlobSizes.size}
        onUpgrade={onUpgrade}
        upgradable={!isSelfHosted}
      />
    </SettingRow>
  );
};

export const AccountSetting: FC = () => {
  const t = useAFFiNEI18N();
  const user = useCurrentUser();
  const setAuthModal = useSetAtom(authAtom);
  const setSignOutModal = useSetAtom(openSignOutModalAtom);

  const onChangeEmail = useCallback(() => {
    setAuthModal({
      openModal: true,
      state: 'sendEmail',
      email: user.email,
      emailType: 'changeEmail',
    });
  }, [setAuthModal, user.email]);

  const onPasswordButtonClick = useCallback(() => {
    setAuthModal({
      openModal: true,
      state: 'sendEmail',
      email: user.email,
      emailType: user.hasPassword ? 'changePassword' : 'setPassword',
    });
  }, [setAuthModal, user.email, user.hasPassword]);

  const onOpenSignOutModal = useCallback(() => {
    setSignOutModal(true);
  }, [setSignOutModal]);

  return (
    <>
      <SettingHeader
        title={t['com.affine.setting.account']()}
        subtitle={t['com.affine.setting.account.message']()}
        data-testid="account-title"
      />
      <AvatarAndName />
      <SettingRow name={t['com.affine.settings.email']()} desc={user.email}>
        <Button onClick={onChangeEmail} className={styles.button}>
          {t['com.affine.settings.email.action']()}
        </Button>
      </SettingRow>
      <SettingRow
        name={t['com.affine.settings.password']()}
        desc={t['com.affine.settings.password.message']()}
      >
        <Button onClick={onPasswordButtonClick} className={styles.button}>
          {user.hasPassword
            ? t['com.affine.settings.password.action.change']()
            : t['com.affine.settings.password.action.set']()}
        </Button>
      </SettingRow>
      <Suspense>
        <StoragePanel />
      </Suspense>
      <SettingRow
        name={t[`Sign out`]()}
        desc={t['com.affine.setting.sign.out.message']()}
        style={{ cursor: 'pointer' }}
        data-testid="sign-out-button"
        onClick={onOpenSignOutModal}
      >
        <ArrowRightSmallIcon />
      </SettingRow>
      {/*<SettingRow*/}
      {/*  name={*/}
      {/*    <span style={{ color: 'var(--affine-warning-color)' }}>*/}
      {/*      {t['com.affine.setting.account.delete']()}*/}
      {/*    </span>*/}
      {/*  }*/}
      {/*  desc={t['com.affine.setting.account.delete.message']()}*/}
      {/*  style={{ cursor: 'pointer' }}*/}
      {/*  onClick={useCallback(() => {*/}
      {/*    toast('Function coming soon');*/}
      {/*  }, [])}*/}
      {/*  testId="delete-account-button"*/}
      {/*>*/}
      {/*  <ArrowRightSmallIcon />*/}
      {/*</SettingRow>*/}
    </>
  );
};
