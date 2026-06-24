import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollInCourse } from '../api/courses';
import { createOrder, verifyPayment, checkPaymentStatus } from '../api/payments';
import { getAccessToken, getStoredUser } from '../utils/auth';
import { isStudent } from '../utils/rbac';

const EnrollButton = ({
  courseSlug,
  coursePrice = 0,
  courseName = '',
  isEnrolled = false,
  size = 'sm',
  className = '',
  onEnrolled,
  showContinue = true,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const user = getStoredUser();
  const token = getAccessToken();

  const isPaid = coursePrice > 0;

  useEffect(() => {
    if (token && isStudent(user) && isPaid && !isEnrolled) {
      checkPaymentStatus(courseSlug)
        .then((res) => setPaymentStatus(res.data))
        .catch(() => {});
    }
  }, [courseSlug, token, isPaid, isEnrolled]);

  const handleRazorpayCheckout = async () => {
    setLoading(true);
    try {
      const orderRes = await createOrder(courseSlug);
      const { orderId, amount, currency, keyId, courseName: name } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'StudyHub',
        description: `Enroll in ${name}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseSlug,
            });
            toast.success('Payment successful! You are now enrolled.');
            onEnrolled?.();
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#6a11cb' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment');
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!token) {
      toast.info('Log in as a student to enroll');
      navigate(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    if (!isStudent(user)) {
      toast.info('Only student accounts can enroll. Sign up as a student or use the demo student account.');
      return;
    }

    if (isEnrolled) {
      navigate(`/courses/${courseSlug}/learn`);
      return;
    }

    if (isPaid && !(paymentStatus?.hasPaid)) {
      handleRazorpayCheckout();
      return;
    }

    setLoading(true);
    try {
      await enrollInCourse(courseSlug);
      toast.success('You joined this course!');
      onEnrolled?.();
    } catch (err) {
      if (err.message === 'Payment required to enroll in this course') {
        handleRazorpayCheckout();
      } else {
        toast.error(err.message || 'Could not enroll');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Link
        to={`/login?redirect=/courses/${courseSlug}`}
        className={`btn btn-${size === 'lg' ? 'primary' : 'outline-primary'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        Log in to enroll
      </Link>
    );
  }

  if (!isStudent(user)) {
    return null;
  }

  if (isEnrolled && showContinue) {
    return (
      <div className={`d-flex flex-column gap-1 ${className}`}>
        <span className="badge bg-success align-self-start">Enrolled</span>
        <Link
          to={`/courses/${courseSlug}/learn`}
          className={`btn btn-success btn-${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          Continue learning
        </Link>
      </div>
    );
  }

  const label = loading
    ? 'Processing…'
    : isEnrolled
      ? 'Go to course'
      : isPaid
        ? `Enroll — ₹${coursePrice}`
        : 'Enroll for free';

  return (
    <button
      type="button"
      className={`btn btn-primary btn-${size} ${className}`}
      disabled={loading}
      onClick={handleEnroll}
    >
      {label}
    </button>
  );
};

export default EnrollButton;
