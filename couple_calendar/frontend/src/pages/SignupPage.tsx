import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkUsername, signup } from '@/features/auth/api';
import styles from './SignupPage.module.css';

type UsernameState = 'idle' | 'ok' | 'taken' | 'invalid';

const reUsername = /^[a-z0-9]{6,16}$/;
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rePhone = /^01[0-9]\d{7,8}$/;
const passRule = (p: string) => {
  if (p.length < 10 || p.length > 20) return false;
  const kinds = [/[A-Za-z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(p)).length;
  return kinds >= 2;
};

export default function SignupPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [unameState, setUnameState] = useState<UsernameState>('idle');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');

  // 약관: 14세, 이용약관, 개인정보(필수) / 마케팅(선택)
  const [agree, setAgree] = useState({ age: false, terms: false, privacy: false, marketing: false });
  const allChecked = agree.age && agree.terms && agree.privacy && agree.marketing;
  const requiredAgreed = agree.age && agree.terms && agree.privacy;
  const toggleAll = () => {
    const v = !allChecked;
    setAgree({ age: v, terms: v, privacy: v, marketing: v });
  };

  const onCheckUsername = async () => {
    if (!reUsername.test(username)) {
      setUnameState('invalid');
      return;
    }
    const { available } = await checkUsername(username);
    setUnameState(available ? 'ok' : 'taken');
  };

  const pwMatch = password2.length > 0 && password === password2;
  const pwValid = passRule(password);

  const valid = useMemo(
    () =>
      unameState === 'ok' &&
      pwValid &&
      pwMatch &&
      name.trim().length > 0 &&
      rePhone.test(phone) &&
      reEmail.test(email) &&
      requiredAgreed,
    [unameState, pwValid, pwMatch, name, phone, email, requiredAgreed],
  );

  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await signup({ username, password, name: name.trim(), email, phone, gender, agreeMarketing: agree.marketing });
      alert('회원가입이 완료되었어요. 환영해요!');
      nav('/', { replace: true });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? e.response?.data?.message ?? '가입에 실패했어요. 잠시 후 다시 시도해주세요.'
        : '가입에 실패했어요.';
      alert(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => nav(-1)} aria-label="뒤로">
          ‹
        </button>
        <h1>회원가입</h1>
      </header>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {/* 아이디 */}
        <div className={styles.field}>
          <label>
            아이디 <span className={styles.req}>*</span>
          </label>
          <div className={styles.inline}>
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={username}
              maxLength={16}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setUnameState('idle');
              }}
            />
            <button type="button" className={styles.sub} onClick={onCheckUsername}>
              중복확인
            </button>
          </div>
          {unameState === 'ok' && <p className={styles.ok}>사용 가능한 아이디예요.</p>}
          {unameState === 'taken' && <p className={styles.err}>이미 사용 중인 아이디예요.</p>}
          {unameState === 'invalid' && (
            <p className={styles.err}>영문 소문자/숫자 6~16자로 입력해주세요.</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className={styles.field}>
          <label>
            비밀번호 <span className={styles.req}>*</span>
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            maxLength={20}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className={password.length === 0 ? styles.hint : pwValid ? styles.ok : styles.err}>
            10~20자, 영문/숫자/특수문자 중 2가지 이상 조합
          </p>
        </div>

        {/* 비밀번호 확인 */}
        <div className={styles.field}>
          <label>
            비밀번호 확인 <span className={styles.req}>*</span>
          </label>
          <input
            type="password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            value={password2}
            maxLength={20}
            onChange={(e) => setPassword2(e.target.value)}
          />
          {password2.length > 0 && (
            <p className={pwMatch ? styles.ok : styles.err}>
              {pwMatch ? '비밀번호가 일치해요.' : '비밀번호가 일치하지 않아요.'}
            </p>
          )}
        </div>

        {/* 이름 */}
        <div className={styles.field}>
          <label>
            이름 <span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            placeholder="이름을 입력해주세요"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 휴대폰 */}
        <div className={styles.field}>
          <label>
            휴대폰 <span className={styles.req}>*</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="휴대폰 번호 입력 (- 없이)"
            value={phone}
            maxLength={11}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          />
          {phone.length > 0 && !rePhone.test(phone) && (
            <p className={styles.err}>휴대폰 번호 형식이 올바르지 않아요.</p>
          )}
        </div>

        {/* 이메일 */}
        <div className={styles.field}>
          <label>
            이메일 <span className={styles.req}>*</span>
          </label>
          <input
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            maxLength={120}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email.length > 0 && !reEmail.test(email) && (
            <p className={styles.err}>이메일 형식이 올바르지 않아요.</p>
          )}
        </div>

        {/* 성별(선택) */}
        <div className={styles.field}>
          <label>성별 (선택)</label>
          <div className={styles.genders}>
            {[
              { v: 'male', t: '남자' },
              { v: 'female', t: '여자' },
              { v: '', t: '선택안함' },
            ].map((g) => (
              <button
                key={g.t}
                type="button"
                className={`${styles.gbtn} ${gender === g.v ? styles.gOn : ''}`}
                onClick={() => setGender(g.v)}
              >
                {g.t}
              </button>
            ))}
          </div>
        </div>

        {/* 약관 동의 */}
        <div className={styles.agreeBox}>
          <button type="button" className={styles.allRow} onClick={toggleAll}>
            <span className={`${styles.check} ${allChecked ? styles.on : ''}`} />
            <strong>전체 동의합니다</strong>
          </button>
          <div className={styles.divider} />
          {[
            { k: 'age', t: '[필수] 만 14세 이상입니다' },
            { k: 'terms', t: '[필수] 이용약관 동의' },
            { k: 'privacy', t: '[필수] 개인정보 수집·이용 동의' },
            { k: 'marketing', t: '[선택] 마케팅 정보 수신 동의' },
          ].map((it) => {
            const key = it.k as keyof typeof agree;
            return (
              <button
                key={it.k}
                type="button"
                className={styles.agreeRow}
                onClick={() => setAgree((a) => ({ ...a, [key]: !a[key] }))}
              >
                <span className={`${styles.check} ${agree[key] ? styles.on : ''}`} />
                <span>{it.t}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.submit}
          disabled={!valid || submitting}
          onClick={onSubmit}
        >
          가입하기
        </button>
      </form>
    </div>
  );
}
